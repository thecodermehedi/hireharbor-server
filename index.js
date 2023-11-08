const express = require("express");
const {MongoClient, ServerApiVersion, ObjectId} = require("mongodb");
require("dotenv").config();
const cors = require("cors");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

//! Application Settings
const app = express();
const port = process.env.PORT || 3000;

//! Middlewares
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://hireharbor.vercel.app",
      "https://hireharbor-client.web.app",
      "https://hireharbor-client.firebaseapp.com",
    ],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

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

    //! VERIFY ACCESS TOKEN (MIDDLEWARE)
    /*  const verifyAccessToken = (req, res, next) => {
      const token = req?.cookies?.token;
      if (!token) {
        return res.status(401).send({message: "Unauthorized access"});
      }
      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
          return res.status(403).send({message: "Invalid token"});
        }
        req.user = decoded;
        next();
      });
    }; */

    //* ROUTE HANDLERS
    //! GET ALL JOB CATEGORIES
    // http://localhost:3000/api/v1/categories
    app.get("/api/v1/categories", async (req, res) => {
      try {
        const categories = await categoriesCollection.find().toArray();
        res.send(categories);
      } catch (error) {
        console.error(error);
        res.status(503).send({message: "Service Unavailable"});
      }
    });

    //! GET ALL JOBS
    // http://localhost:3000/api/v1/jobs situation 1
    // http://localhost:3000/api/v1/jobs?category=part-time situation 2

    app.get("/api/v1/jobs", async (req, res) => {
      try {
        let query = {};
        if (req?.query?.category) {
          query.category = req?.query?.category;
        }
        const options = {
          projection: {
            company: 0,
            logo: 0,
            banner: 0,
            location: 0,
            employmentType: 0,
            experienceLevel: 0,
            jobFunctions: 0,
            industries: 0,
            qualifications: 0,
            responsibilities: 0,
            aboutCompany: 0,
          },
        };
        const jobs = await jobsCollection.find(query, options).toArray();
        res.send(jobs);
      } catch (error) {
        console.error(error);
        res.status(500).send({message: "An error occurred"});
      }
    });

    //! GET SINGLE JOB
    // http://localhost:3000/api/v1/job/654713acdfaace3a2427f482
    app.get("/api/v1/job/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const filter = {_id: new ObjectId(id)};
        const job = await jobsCollection.findOne(filter);
        res.send(job);
      } catch (error) {
        console.error(error);
        res.status(500).send({message: "An error occurred"});
      }
    });

    //! PATCH SINGLE JOB
    // increase applicants by 1
    // http://localhost:3000/api/v1/job/654713acdfaace3a2427f482
    app.patch("/api/v1/job/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const filter = {_id: new ObjectId(id)};
        const updateDocument = {
          $inc: {applicants: 1},
        };
        const result = await jobsCollection.updateOne(filter, updateDocument);
        res.send(result);
      } catch (error) {
        console.error(error);
        res.status(500).send({message: "An error occurred"});
      }
    });

    //! APPLY FOR A JOB
    // http://localhost:3000/api/v1/applications
    // example body:
    //  application = {user, email, resume, company, logo, title, banner, poster, postermail, posted, desc, category,deadline, apllicants, salary }
    app.post("/api/v1/applications", async (req, res) => {
      try {
        const application = req.body;
        const result = await applicationsCollection.insertOne(application);
        res.send(result);
      } catch (error) {
        console.error(error);
        res.status(500).send({message: "An error occurred"});
      }
    });

    //! GET ALL APPLIED JOBS
    // http://localhost:3000/api/v1/applications?email=example@gmail.com
    app.get("/api/v1/applications", async (req, res) => {
      try {
        const email = req.query.email;
        const filter = {email: email};
        const applications = await applicationsCollection
          .find(filter)
          .toArray();
        res.send(applications);
      } catch (error) {
        console.error(error);
        res.status(500).send({message: "An error occurred"});
      }
    });

    //! POST A JOB
    // http://localhost:3000/api/v1/jobs
    // example body:
    //  job = {company, logo, title, banner, poster, postermail, posted, desc, category, deadline, apllicants, salary }
    app.post("/api/v1/jobs", async (req, res) => {
      try {
        const job = req.body;
        const result = await jobsCollection.insertOne(job);
        res.send(result);
      } catch (error) {
        console.error(error);
        res.status(500).send({message: "An error occurred"});
      }
    });

    //! GET ALL POSTED JOBS
    // http://localhost:3000/api/v1/postedjobs?email=alex@mail.com
    app.get("/api/v1/postedjobs", async (req, res) => {
      try {
        const email = req.query.email;
        const filter = {postermail: email};
        const jobs = await jobsCollection.find(filter).toArray();
        res.send(jobs);
      } catch (error) {
        console.error(error);
        res.status(500).send({message: "An error occurred"});
      }
    });

    //! UPDATE A POSTED JOB
    // http://localhost:3000/api/v1/postedjobs/654713acdfaace3a2427f482
    app.patch("/api/v1/postedjobs/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const job = req.body;
        const filter = {_id: new ObjectId(id)};
        const updateDocument = {
          $set: job,
        };
        const result = await jobsCollection.updateOne(filter, updateDocument);
        res.send(result);
      } catch (error) {
        console.error(error);
        res.status(500).send({message: "An error occurred"});
      }
    });

    //! DELETE A POSTED JOB
    // http://localhost:3000/api/v1/postedjobs/654713acdfaace3a2427f482
    app.delete("/api/v1/postedjobs/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const filter = {_id: new ObjectId(id)};
        const result = await jobsCollection.deleteOne(filter);
        res.send(result);
      } catch (error) {
        console.error(error);
        res.status(500).send({message: "An error occurred"});
      }
    });

    //! GET ACCESS TOKEN (POST)
    // http://localhost:3000/api/v1/auth/accesstoken
    app.post("/api/v1/auth/accesstoken", async (req, res) => {
      try {
        const user = req.body;
        const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
          expiresIn: "30d",
        });
        res
          .cookie("token", accessToken, {
            httpOnly: false,
            secure: true,
            sameSite: "lax",
          })
          // .send({accessToken});
          .send({suceess: true});
      } catch (error) {
        console.error(error);
        res.status(500).send({message: "An error occurred"});
      }
    });

    //! REMOVE ACCESS TOKEN (POST)
    // http://localhost:3000/api/v1/auth/logout
    app.post("/api/v1/auth/logout", async (req, res) => {
      try {
        res.clearCookie("token").send({success: true});
      } catch (error) {
        console.error(error);
        res.status(500).send({message: "An error occurred"});
      }
    });
  } catch (error) {
    console.error("Failed to connect to MongoDB", error);
    process.exit(1);
  }
};
connectToMongoDB().then(() => {
  app.listen(port, () => console.log(`HireHarbor listening on port ${port}!`));
});
