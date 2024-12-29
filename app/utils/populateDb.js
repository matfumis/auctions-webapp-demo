const { MongoClient } = require("mongodb");
const { DateTime } = require("luxon");

const uri = "mongodb://localhost:27017"; 
const dbName = "auctions_db"; 

const seedData = async () => {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(dbName);

    const usersCollection = db.collection("users");
    const auctionsCollection = db.collection("auctions");

    await usersCollection.deleteMany({});
    await auctionsCollection.deleteMany({});

    const users = [
      {
        id: 10001,
        username: "john_doe",
        name: "John",
        surname: "Doe",
        password: "hashed_password_123",
        winningBids: []
      },
      {
        id: 10002,
        username: "jane_smith",
        name: "Jane",
        surname: "Smith",
        password: "hashed_password_456",
        winningBids: []
      },
      {
        id: 10003,
        username: "alice_jones",
        name: "Alice",
        surname: "Jones",
        password: "hashed_password_789",
        winningBids: []
      }
    ];
    await usersCollection.insertMany(users);

    const now = DateTime.now().setZone("Europe/Rome");
    const auctions = [
      {
        id: 20001,
        title: "Vintage Guitar",
        description: "A classic vintage guitar from the 1970s, in excellent condition.",
        sellerId: 10001,
        sellerUsername: "john_doe",
        startPrice: 500,
        currentPrice: 500,
        startTime: now.toISO(),
        endTime: now.plus({ days: 15 }).toISO(),
        open: true,
        winner: "",
        bidsHistory: []
      },
      {
        id: 20002,
        title: "Mountain Bike",
        description: "High-performance mountain bike, barely used.",
        sellerId: 10002,
        sellerUsername: "jane_smith",
        startPrice: 300,
        currentPrice: 300,
        startTime: now.toISO(),
        endTime: now.plus({ days: 10 }).toISO(),
        open: true,
        winner: "",
        bidsHistory: []
      },
      {
        id: 20003,
        title: "Smartphone",
        description: "Latest model smartphone, sealed in box.",
        sellerId: 10003,
        sellerUsername: "alice_jones",
        startPrice: 700,
        currentPrice: 700,
        startTime: now.toISO(),
        endTime: now.plus({ days: 20 }).toISO(),
        open: true,
        winner: "",
        bidsHistory: []
      },
      {
        id: 20004,
        title: "Art Painting",
        description: "Beautiful landscape painting by a renowned artist.",
        sellerId: 10001,
        sellerUsername: "john_doe",
        startPrice: 1000,
        currentPrice: 1000,
        startTime: now.toISO(),
        endTime: now.plus({ days: 25 }).toISO(),
        open: true,
        winner: "",
        bidsHistory: []
      },
      {
        id: 20005,
        title: "Gaming Console",
        description: "Next-gen gaming console with two controllers.",
        sellerId: 10002,
        sellerUsername: "jane_smith",
        startPrice: 400,
        currentPrice: 400,
        startTime: now.toISO(),
        endTime: now.plus({ days: 5 }).toISO(),
        open: true,
        winner: "",
        bidsHistory: []
      }
    ];
    await auctionsCollection.insertMany(auctions);

    console.log("Database populated successfully!");
  } catch (err) {
    console.error("Error populating database:", err);
  } finally {
    await client.close();
  }
};

seedData();
