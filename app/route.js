const express = require("express");
const router = express.Router();
const db = require("./db.js");
const jwt = require("jsonwebtoken");
const secret = 'secret';

/*
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['cookie'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).send('Token required');

  jwt.verify(token, secret, (err, user) => {
    if (err) return res.status(403).send('Invalid or expired token');
    req.username = user;
    next();
  });
};

 */

const verifyToken = (req, res, next) => {
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

router.get('/users/:id', async (req, res) => {
  const mongo = await db.connectToDb();
  const user = await mongo.collection('users').findOne({id: parseInt(req.params.id)});
  const {id, username, name, surname, winningBids} = user;
  res.json({id, username, name, surname, winningBids});
});

router.get('/users/', async (req, res) => {
  const mongo = await db.connectToDb();
  const query = req.query.q;

  const filter = query
    ? {
      $or: [
        {name: {$regex: `^${query}`, $options: 'i'}},
        {surname: {$regex: `^${query}`, $options: 'i'}},
        {username: {$regex: `^${query}`, $options: 'i'}}
      ]
    }
    : {};

  const users = await mongo.collection('users').find(filter).toArray();
  res.json(users);
});

router.get('/auctions/', async (req, res) => {
  const mongo = await db.connectToDb();
  const query = req.query.q;

  const filter = query
    ? {
      $or: [
        {title: {$regex: `^${query}`, $options: 'i'}},
        {description: {$regex: `^${query}`, $options: 'i'}}
      ]
    }
    : {};

  const auctions = await mongo.collection('auctions').find(filter).toArray();
  res.json(auctions);
});

router.get('/auctions/:id', async (req, res) => {
  const mongo = await db.connectToDb();
  const auction = await mongo.collection('auctions').findOne({id: parseInt(req.params.id)});
  const {id, title, description, sellerId, status} = auction;
  res.json({id, title, description, sellerId, status});
})

router.get('/auctions/:id/bids', async (req, res) => {
  const mongo = await db.connectToDb();
  const auction = await mongo.collection('auctions').findOne({id: parseInt(req.params.id)});
  const {bids} = auction;
  res.json({bids});
})

router.get('/bids/:id', async (req, res) => {
  const mongo = await db.connectToDb();
  const bid = await mongo.collection('bids').findOne({id: parseInt(req.params.id)});
  res.json(bid);
});

router.get('/whoami', verifyToken, async (req, res) => {
  const {id} = jwt.decode(req.cookies.token);
  const mongo = await db.connectToDb();
  const user = await mongo.collection('users').findOne({id: parseInt(id)});
  res.json(user);
})



module.exports = router;