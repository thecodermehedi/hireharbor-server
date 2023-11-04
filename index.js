const express = require("express");
const app = express();
const port = 3000;

app.get("/", (req, res) => res.send("HireHarbor Server is running..."));
app.listen(port, () => console.log(`HireHarbor listening on port ${port}!`));
