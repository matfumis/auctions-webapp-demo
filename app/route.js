const express = require("express");
const router = express.Router();
const db = require("./db.js");
const jwt = require("jsonwebtoken");
const secret = 'secret';

const { DateTime } = require('luxon');


router.use(async (req, res, next) => {
  try {
    req.db = await db.connectToDb(); // questo middleware, messo per primo, viene sempre eseguito e "incorpora" la connessione nella richiesta (ottimizzazione)
    next(); // necessario sennò non viene eseguito nulla
  } catch (err) {
    console.error(err);
    res.status(500);
  }
});

const verifyAuthentication = (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ msg: 'No token provided, please login' });
    }
    jwt.verify(token, secret, (err) => {
      if (err) {
        return res.status(401).json({ msg: 'Authentication failed' });
      }
      next();
    });
  } catch (err) {
    console.error(err);
    res.status(500);
  }
}

const updateAuctionStatus = async (req, res, next) => {
  try {
    const now = DateTime.now().setZone('Europe/Rome');
    const expiredAuctions = await req.db.collection('auctions').find({ endTime: { $lt: now }, open: true }).toArray();
    for (const auction of expiredAuctions) {
      if (auction.bidsHistory.length > 0) {
        const winnerUsername = auction.bidsHistory[auction.bidsHistory.length - 1].bidder;
        const highestBid = (auction.bidsHistory[auction.bidsHistory.length - 1]);

        const winningBid = {
          item: auction.title,
          amount: highestBid.amount,
          timestamp: highestBid.timestamp,
        }

        const winner = await req.db.collection('users').findOne({ username: winnerUsername });
        if (winnerUsername !== auction.sellerUsername) {
          winner.winningBids.push(winningBid);
          await req.db.collection('users').updateOne({ username: winnerUsername }, { $push: { winningBids: winningBid } });
        }
        const changes = {
          open: false,
          winner: winnerUsername
        }
        await req.db.collection('auctions').updateOne({ id: auction.id }, { $set: changes });
      } else {
        const changes = {
          open: false,
        }
        await req.db.collection('auctions').updateOne({ id: auction.id }, { $set: changes });
      }
    }
    next();
  } catch (err) {
    console.error(err);
    res.status(500);
  }
}

const verifyAuctionStatus = async (req, res, next) => {
  try {
    const auction = await req.db.collection("auctions").findOne({ id: parseInt(req.params.id) });
    if (!auction.open) {
      return res.status(401).json({ msg: 'The auction is expired' });
    }
    next();
  } catch (err) {
    console.error(err);
    res.status(500);
  }
};


const verifyBidValidity = async (req, res, next) => {
  try {
    const auction = await req.db.collection("auctions").findOne({ id: parseInt(req.params.id) });

    if (!auction) {
      return res.status(404);
    }

    let highestBid;
    if (auction.bidsHistory && auction.bidsHistory.length > 0) {
      highestBid = auction.bidsHistory[auction.bidsHistory.length - 1].amount;
    } else {
      highestBid = auction.startPrice;
    }

    const attemptedBid = req.body.amount;

    if (attemptedBid <= highestBid) {
      return res.status(406).json({ msg: 'The bid is not valid' });
    }

    next();
  } catch (err) {
    console.error(err);
    res.status(500);
  }
};

const verifyAuctionValidity = async (req, res, next) => {
  try {
    const now = DateTime.now().setZone('Europe/Rome');
    const endTime = DateTime.fromISO(req.body.endTime, { zone: 'Europe/Rome' });
    const startPrice = req.body.startPrice;
    if (endTime < now || startPrice <= 0) {
      return res.status(401).json({ msg: 'The auction is not valid' });
    }
    next();
  } catch (err) {
    console.error(err);
    res.status(500);
  }
}

const verifyAuthorization = async (req, res, next) => {
  try {
    console.log(req.params.id);
    const auction = await req.db.collection("auctions").findOne({ id: parseInt(req.params.id) });
    const { id } = jwt.decode(req.cookies.token);
    const requestingUserId = parseInt(id);
    const auctionSellerId = parseInt(auction.sellerId);
    if (requestingUserId !== auctionSellerId) {
      return res.status(401).json({ msg: 'Unauthorized' });
    }
    next();
  } catch (err) {
    console.error(err);
    res.status(500);
  }
}

router.get('/users/:id', updateAuctionStatus, async (req, res) => {
  try {
    const user = await req.db.collection('users').findOne({ id: parseInt(req.params.id) });

    if (!user) {
      return res.status(400).json({ msg: 'User not found' });
    }
    const { username, name, surname, winningBids } = user;
    res.status(200).json({ username, name, surname, winningBids });
  } catch (err) {
    console.error(err);
    res.status(500);
  }
});

router.get('/users', updateAuctionStatus, async (req, res) => {
  try {
    const query = req.query.q;
    const filter = query
      ? {
        $or: [
          { name: { $regex: `${query}`, $options: 'i' } },
          { surname: { $regex: `${query}`, $options: 'i' } },
          { username: { $regex: `${query}`, $options: 'i' } }
        ]
      }
      : {};
    const users = await req.db.collection('users').find(filter).toArray();
    res.status(200).json(users);
  } catch (err) {
    console.error(err);
    res.status(500);
  }
});

router.get('/auctions', updateAuctionStatus, async (req, res) => {
  try {
    const query = req.query.q;
    const filter = query
      ? {
        $or: [
          { title: { $regex: `${query}`, $options: 'i' } },
          { description: { $regex: `${query}`, $options: 'i' } },
          ...(Number.isInteger(Number(query))
            ? [{ sellerId: Number(query) }]
            : []),
        ]
      }
      : {};

    const auctions = await req.db.collection('auctions').find(filter).sort({ startTime: -1 }).toArray();
    res.status(200).json(auctions);
  } catch (err) {
    console.error(err)
    res.status(500)
  }
});

router.get('/auctions/:id', updateAuctionStatus, async (req, res) => {
  try {
    const auction = await req.db.collection('auctions').findOne({ id: parseInt(req.params.id) });
    if (!auction) {
      return res.status(400).json({ msg: 'Auction not found' });
    }
    //const { id, title, description, sellerId, status } = auction;
    //res.status(200).json({ id, title, description, sellerId, status });
    res.status(200).json(auction);
  } catch (err) {
    console.error(err);
    res.status(500);
  }
});

router.get('/auctions/:id/bids', async (req, res) => {
  try {
    const auction = await req.db.collection('auctions').findOne({ id: parseInt(req.params.id) });

    if (!auction) {
      return res.status(400).json({ msg: 'Auction not found' });
    }

    const { bids } = auction;
    const sortedBids = bids.sort({ amount: -1 }).toArray();
    res.status(200).json(sortedBids);
    // res.json({bids});
  } catch (err) {
    console.error(err);
    res.status(500);
  }
});

router.get('/bids/:id', async (req, res) => {
  try {
    const bid = await req.db.collection('auctions').findOne({ "bidsHistory.id": parseInt(req.params.id) }, { projection: { "bidsHistory.$": 1 } });
    if (!bid) {
      return res.status(400).json({ msg: "Bid not found" });
    }
    res.status(200).json(bid);
  } catch (err) {
    console.error(err);
    res.status(500);
  }
});

router.get('/whoami', verifyAuthentication, async (req, res) => {
  try {
    const { id } = jwt.decode(req.cookies.token);
    const user = await req.db.collection('users').findOne({ id: parseInt(id) });
    res.status(200).json(user);
  } catch (err) {
    console.error(err);
    res.status(500);
  }
});

router.post('/auctions', verifyAuthentication, verifyAuctionValidity, async (req, res) => {
  try {
    const { id } = jwt.decode(req.cookies.token);
    const user = await req.db.collection('users').findOne({ id: parseInt(id) });
    const auction = {
      id: generateId(),
      title: req.body.title,
      description: req.body.description,
      sellerId: id,
      sellerUsername: user.username,
      startPrice: parseInt(req.body.startPrice),
      currentPrice: parseInt(req.body.startPrice),
      startTime: DateTime.now().setZone('Europe/Rome'),
      endTime: DateTime.fromISO(req.body.endTime, { zone: 'Europe/Rome' }),
      open: true,
      winner: '',
      bidsHistory: []
    }

    await req.db.collection('auctions').insertOne(auction);
    res.status(200).json({ msg: 'Auction successfully created!', auction });
  } catch (err) {
    console.error(err);
    res.status(500);
  }

});

router.put('/auctions/:id', verifyAuthentication, verifyAuthorization, async (req, res) => {
  try {
    const auction = req.db.collection('auctions').findOne({ id: parseInt(req.params.id) });

    if (!auction) {
      return res.status(400).json({ msg: 'Auction not found' });
    }

    let changes = {
      title: req.body.title,
      description: req.body.description,
    }

    await req.db.collection('auctions').updateOne({ id: parseInt(req.params.id) }, { $set: changes });
    res.status(200).json({ msg: 'Auction successfully updated!', auction });
  } catch (err) {
    console.error(err);
    res.status(500);
  }
});

router.delete('/auctions/:id', verifyAuthentication, verifyAuthorization, async (req, res) => {
  try {
    const auction = req.db.collection('auctions').findOne({ id: parseInt(req.params.id) });
    if (!auction) {
      return res.status(400).json({ msg: 'Auction not found' });
    }
    await req.db.collection('auctions').deleteOne({ id: parseInt(req.params.id) });
    res.status(200).json({ msg: 'Auction successfully deleted!' });
  } catch (err) {
    console.error(err);
    res.status(500);
  }
});



router.post('/auctions/:id/bids', verifyAuthentication, verifyAuctionStatus, verifyBidValidity, async (req, res) => {
  try {
    const { id } = jwt.decode(req.cookies.token);
    const user = await req.db.collection('users').findOne({ id: parseInt(id) });
    const auction = await req.db.collection('auctions').findOne({ id: parseInt(req.params.id) });

    if (!auction) {
      return res.status(400).json({ msg: 'Auction not found' });
    }

    const bid = {
      id: generateId(),
      bidder: user.username,
      amount: req.body.amount,
      timestamp: DateTime.now().setZone('Europe/Rome')
    }
    auction.bidsHistory.push(bid);
    await req.db.collection('auctions').updateOne({ id: auction.id }, {
      $set: {
        bidsHistory: auction.bidsHistory,
        currentPrice: bid.amount
      }
    });
    res.status(200).json({ msg: 'Bid successfully placed!', bid });
  } catch (err) {
    console.error(err);
    res.status(500);
  }
});

router.post('/signout', verifyAuthentication, (req, res) => {
  try {
    res.clearCookie("token", { httpOnly: true });
    res.status(200).json({ msg: 'Successfully signed out!' });
  } catch (err) {
    console.error(err);
    res.status(500);
  }
});

const generateId = () => Math.floor(10000 + Math.random() * 90000);

module.exports = router;