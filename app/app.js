const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const router = require("./route.js");
const auth = require('./auth.js');
const populate = require("./utils/populateDb.js");

const port = 8000;



app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use('/api/auth', auth);
app.use('/api', router);

app.listen(port, async () => {
  try {
    await populate.seedData();
    console.log("Database initialized");
  } catch (error) {
    console.error("Error initializing database");
  }
  console.log(`Web server started on port ${port}`);
});