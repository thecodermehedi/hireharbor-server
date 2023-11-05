const express = require("express");
const {MongoClient, ServerApiVersion, ObjectId} = require("mongodb");
require("dotenv").config();
const cors = require("cors");

//! Application Settings
const app = express();
const port = process.env.PORT || 3000;

//! Middlewares
app.use(cors());
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

    //! MongoDB Collections
    const db = client.db("hireharborDB");
    const jobsCollection = db.collection("jobs");
    const applicationsCollection = db.collection("applications");
    const categoriesCollection = db.collection("categories");

    //! GET ALL JOB CATEGORIES
    // http://localhost:3000/api/v1/categories
    app.get("/api/v1/categories", async (req, res) => {
      try {
        const categories = await categoriesCollection.find().toArray();
        res.send(categories);
      } catch (error) {
        console.error(error);
        res.status(500).send({message: "An error occurred"});
      }
    });


  } catch (error) {
    console.log(error);
  }
};
connectToMongoDB();

app.get("/", (req, res) => res.send("HireHarbor Server is running..."));
app.listen(port, () => console.log(`HireHarbor listening on port ${port}!`));
