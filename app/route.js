const express = require("express");
const router = express.Router();
const db = require("./db.js");
const jwt = require("jsonwebtoken");
const secret = 'secret';


router.use(async (req, res, next) => {
  try {
    req.db = await db.connectToDb(); // questo middleware, messo per primo, viene sempre eseguito e "incorpora" la connessione nella richiesta (ottimizzazione)
    next(); // necessario sennò non viene eseguito nulla
  } catch (err) {
    console.error("Database connection failed:", err);
    res.status(500).send("Internal Server Error");
  }
});

const verifyAuthentication = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).send("No token provided, please login");
  }
  jwt.verify(token, secret, (err) => {
    if (err) {
      return res.status(401).send(err);
    }
    next();
  });
};

const verifyAuctionStatus = async (req, res, next) => {
  const auction = await req.db.collection("auctions").findOne({id: req.params.id});
  const now = new Date();
  const auctionEndTime = auction.endTime;
  if (now < auctionEndTime) {
    next();
  } else {
    res.status(406).send("The auction is expired");
  }
};

const verifyBidValidity = async (req, res, next) => {
  const auction = await req.db.collection("auctions").findOne({id: req.params.id});
  console.log("Auction ID:", auction.id);
  const highestBid = auction.bidsHistory[auction.bidsHistory.length - 1].amount;
  const attemptedBid = req.body.amount;
  if (highestBid < attemptedBid) {
    next();
  } else {
    res.status(406).send("The bid is not valid");
  }
};

const verifyAuthorization = async (req, res, next) => {
  const auction = await req.db.collection('auctions').findOne({id: parseInt(req.params.id)});
  const {id} = jwt.decode(req.cookies.token);
  const requestingUserId = parseInt(id);
  const auctionSellerId = parseInt(auction.sellerId);
  if (requestingUserId === auctionSellerId) {
    next();
  } else {
    res.status(401).send("Not authorized");
  }
}

router.get('/users/:id', async (req, res) => {
  const user = await req.db.collection('users').findOne({id: parseInt(req.params.id)});
  const {id, username, name, surname, winningBids} = user;
  res.json({id, username, name, surname, winningBids});
});

router.get('/users', async (req, res) => {
  const query = req.query.q;

  const filter = query
    ? {
      $or: [
        {name: {$regex: `${query}`, $options: 'i'}},
        {surname: {$regex: `${query}`, $options: 'i'}},
        {username: {$regex: `${query}`, $options: 'i'}}
      ]
    }
    : {};

  const users = await req.db.collection('users').find(filter).toArray();
  res.json(users);
});

router.get('/auctions', async (req, res) => {
  const query = req.query.q;

  const filter = query
    ? {
      $or: [
        {title: {$regex: `${query}`, $options: 'i'}},
        {description: {$regex: `${query}`, $options: 'i'}}
      ]
    }
    : {};

  const auctions = await req.db.collection('auctions').find(filter).sort({startTime: -1}).toArray();
  res.json(auctions);
});

router.get('/auctions/:id', async (req, res) => {
  const auction = await req.db.collection('auctions').findOne({id: parseInt(req.params.id)});
  const {id, title, description, sellerId, status} = auction;
  res.json({id, title, description, sellerId, status});
})

router.get('/auctions/:id/bids', async (req, res) => {
  const auction = await req.db.collection('auctions').findOne({id: parseInt(req.params.id)});
  const {bids} = auction;
  res.json({bids});
})

router.get('/bids/:id', async (req, res) => {
  const bid = await req.db.collection('bids').findOne({id: parseInt(req.params.id)});
  res.json(bid);
});

router.get('/whoami', verifyAuthentication, async (req, res) => {
  const {id} = jwt.decode(req.cookies.token);
  const user = await req.db.collection('users').findOne({id: parseInt(id)});
  res.status(200).json(user);
})

router.post('/auctions', verifyAuthentication, async (req, res) => {
  const {id} = jwt.decode(req.cookies.token);
  const auction = {
    id: generateId(),
    title: req.body.title,
    description: req.body.description,
    sellerId: id,
    startPrice: parseInt(req.body.startPrice),
    currentPrice: parseInt(req.body.startPrice),
    startTime: new Date(),
    endTime: new Date(req.body.endTime),
    status: 'open',
    bidsHistory: [
      {
        bidderId: id,
        amount: parseInt(req.body.startPrice),
        timestamp: new Date()
      }
    ]
  }

  await req.db.collection('auctions').insertOne(auction);
  res.status(200).send("Auction successfully created!");

});

router.put('/auctions/:id', verifyAuthentication, verifyAuthorization, async (req, res, err) => {
  const auction = await req.db.collection('auctions').findOne({id: parseInt(req.params.id)});

  let changes = {
    title: req.body.title,
    description: req.body.description,
    endTime: req.body.endTime,
  }
  await req.db.collection('auctions').updateOne(changes, auction);
  res.status(200).send("Auction successfully updated!");

});

router.delete('/auctions/:id', verifyAuthentication, verifyAuthorization, async (req, res, err) => {
  await req.db.collection('auctions').deleteOne({id: parseInt(req.params.id)});
});

router.post('/auctions/:id/bids', verifyAuthentication, async (req, res) => {
  const auction = await req.db.collection('auctions').findOne({id: parseInt(req.params.id)});
  console.log(auction.id);
  const highestBid = auction.bidsHistory[auction.bidsHistory.length - 1].amount;
  const attemptedBid = req.body.amount;
  if (highestBid < attemptedBid) {
    const bid = {
      id: generateId(),
      amount: req.body.amount,
      timeStamp: new Date()
    }
    auction.bidsHistory.push(bid);
    await req.db.collection('auctions').updateOne(
      { id: auction.id },
      { $set: { bidsHistory: auction.bidsHistory, currentPrice: bid.amount } }
    );
    res.status(200).send("Bid successfully placed!");
  } else {
    res.status(406).send("The bid is not valid");
  }
});

router.get('/signout', verifyAuthentication, (req, res) => {
  res.cookie("token", ' ', {
    httpOnly: true,
    expires: new Date(0)
  });
  res.status(200).send('Successfully signed out!');
});


const generateId = () => Math.floor(10000 + Math.random() * 90000);

module.exports = router;