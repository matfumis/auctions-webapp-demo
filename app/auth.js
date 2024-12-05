const express = require("express");
const router = express.Router();
const db = require("./db.js");
const jwt = require('jsonwebtoken');

const secret = 'secret';

router.post('/signup', async (req, res) => {
  try {
    const mongo = await db.connectToDb();
    if (await isUsernameUnique(req.body.username, mongo)) {
      const user = {
        id: generateId(),
        name: req.body.name,
        surname: req.body.surname,
        username: req.body.username,
        password: req.body.password,
        winningBids: []
      }
      await mongo.collection("users").insertOne(user);
      res.status(200).send("Successfully registered user!");
    } else {
      res.status(400).send("Username already taken!");
    }
  } catch (error) {
    res.status(500).send("Internal server error!");
  }
});

router.post('/login', async (req, res) => {
  try {
    const {username, password} = req.body;

    const mongo = await db.connectToDb();
    const user = await mongo.collection("users").findOne({username: username});

    if (await areUsernameAndPasswordValid(username, password, mongo)) {
      const data = {id: user.id}
      const token = jwt.sign(data, secret, {expiresIn: '24h'});
      res.cookie("token", token, {httpOnly: true});
      res.json("Authenticated!");
    } else {
      res.status(401).send("Invalid username or password!");
    }

  } catch (err) {
    res.status(500).send("Internal server error!");
  }
});

async function isUsernameUnique(username, mongo) {
  const cursor = await mongo.collection("users").findOne({username: username});
  return !cursor;
}

async function areUsernameAndPasswordValid(username, password, mongo) {
  const cursor = await mongo.collection("users").findOne({username: username, password: password});
  return !!cursor;
}


const generateId = () => Math.floor(10000 + Math.random() * 90000);


module.exports = router;