const mongoose = require("mongoose");
require('dotenv').config();

const mongoURL = process.env.MONGO_URL_LOCAL

mongoose.connect(mongoURL);

const db = mongoose.connection;

db.on("connected", () => {
  console.log("Connected to MongoDB Server");
});
db.on("disconnected", () => {
  console.log("Unable to connect to MongoDB Server");
});
db.on("error", (err) => {
  console.error("Error: ", err);
});

module.exports = db;