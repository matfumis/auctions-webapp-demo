const express = require("express");
const router = express.Router();
const db = require("./db.js");
const jwt = require('jsonwebtoken');

const secret = 'secret';


const verifySignupValidity = async (req, res, next) => {
  if (!req.body.username || req.body.username.trim() === "" ||
    !req.body.name || req.body.name.trim() === "" ||
    !req.body.surname || req.body.surname.trim() === "" ||
    !req.body.password || req.body.password.trim() === ""
  ) {
    return res.status(400).json({msg: 'Some fields are invalid', body: req.body});
  }
  next();
}


router.post('/signup', verifySignupValidity, async (req, res) => {
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
      const userData = {
        name: user.name,
        surname: user.surname,
        username: user.username
      }
      res.status(200).json({msg: 'User succesfully created!', user: userData});
    } else {
      res.status(400).json({msg: 'Username already taken'});
    }
  } catch (err) {
    console.error(err)
    res.status(500).json({msg: 'Server error'});
  }
});

router.post('/signin', async (req, res) => {
  try {
    const { username, password } = req.body;
    const mongo = await db.connectToDb();
    const user = await mongo.collection("users").findOne({ username: username });

    if (await areUsernameAndPasswordValid(username, password, mongo)) {
      const data = { id: user.id }
      const token = jwt.sign(data, secret, { expiresIn: 86400 });
      res.cookie("token", token, { httpOnly: true });
      res.status(200).json({msg: 'Successfully logged in!'})
    } else {
      res.status(400).send({msg:'Invalid username or password'});
    }

  } catch (err) {
    console.error(err);
    res.status(500).json('Server error');
  }
});


async function isUsernameUnique(username, mongo) {
  const cursor = await mongo.collection("users").findOne({ username: username });
  return !cursor;
}

async function areUsernameAndPasswordValid(username, password, mongo) {
  const cursor = await mongo.collection("users").findOne({ username: username, password: password });
  return !!cursor;
}


const generateId = () => Math.floor(10000 + Math.random() * 90000);


module.exports = router;