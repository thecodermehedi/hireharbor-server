const express = require("express");
const {MongoClient, ServerApiVersion, ObjectId} = require("mongodb");
require("dotenv").config();

//! Application Settings
const app = express();
const port = process.env.PORT || 3000;

//! Middlewares
app.use(express.json());

//! MongoDB URI
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@hireharborcluster.i3brrrj.mongodb.net/?retryWrites=true&w=majority`;

//! MongoDB Client
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

//! MongoDB Connection
const connectToMongoDB = async () => {
  try {
    await client.connect();
    console.log("Connected to MongoDB");
  } catch (error) {
    console.log(error);
  }
};
connectToMongoDB();

app.get("/", (req, res) => res.send("HireHarbor Server is running..."));
app.listen(port, () => console.log(`HireHarbor listening on port ${port}!`));
