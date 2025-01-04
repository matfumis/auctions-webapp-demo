const express = require("express");
const bcrypt = require("bcryptjs");
const router = express.Router();
const db = require("./db.js");
const jwt = require('jsonwebtoken');

const secret = 'secret';


const verifySignupValidity = async (req, res, next) => {
  if (!req.body.username.trim() || !req.body.name.trim() || !req.body.surname.trim() || !req.body.password.trim()) {
    return res.status(400).json({ msg: 'Some fields are invalid' });
  }
  const mongo = await db.connectToDb();
  const cursor = await mongo.collection("users").findOne({ username: req.body.username });
  if (cursor) {
    return res.status(400).json({ msg: 'Username already taken' });
  }
  next();
}

router.post('/signup', verifySignupValidity, async (req, res) => {
  try {
    const mongo = await db.connectToDb();
    
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const user = {
      id: generateId(),
      name: req.body.name,
      surname: req.body.surname,
      username: req.body.username,
      password: hashedPassword,
      winningBids: []
    }
    await mongo.collection("users").insertOne(user);
    const userData = {
      name: user.name,
      surname: user.surname,
      username: user.username
    }
    res.status(200).json({ msg: 'Successfully signed up! Now you can sign in', user: userData });

  } catch (err) {
    console.error(err)
    res.status(500).json({ msg: 'Server error' });
  }
});

router.post('/signin', async (req, res) => {
  try {
    const { username, password } = req.body;
    const mongo = await db.connectToDb();
    const user = await mongo.collection("users").findOne({ username: username });

    if (user && await bcrypt.compare(password, user.password)) {
      const data = { id: user.id }
      const token = jwt.sign(data, secret, { expiresIn: 86400 });
      res.cookie("token", token, { httpOnly: true });
      res.status(200).json({ msg: 'Successfully signed in!' })
    } else {
      res.status(400).send({ msg: 'Invalid username or password' });
    }

  } catch (err) {
    console.error(err);
    res.status(500).json('Server error');
  }
});

const generateId = () => Math.floor(10000 + Math.random() * 90000);

module.exports = router;