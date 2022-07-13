require("dotenv").config();
const express = require("express");
const mongo = require("mongodb");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
const bodyParser = require("body-parser");
const dns = require("dns");

// Basic Configuration
const port = process.env.PORT || 3000;

const uri = process.env.DB_URI;

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
console.log(mongoose.connection.readyState);

const schema = new mongoose.Schema({ url: "string" });
const Url = mongoose.model("url", schema);

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));

app.post("/api/shorturl", function (req, res) {
  // console.log(req.body.url);
  const urlCheck = new URL(req.body.url);
  const hostNm = urlCheck.hostname;

  dns.lookup(hostNm, (err, address, family) => {
    if (err == null) {
      const url = new Url({ url: req.body.url });
      url.save((err, data) =>
        res.json({ original_url: data.url, short_url: data.id })
      );
    } else {
      res.json({ error: "invalid url" });
    }
  });
});
// res.send({ original_url: req.body.url });

app.get("/api/shorturl/:id", function (req, res) {
  console.log(req.params.id);
  Url.findById(req.params.id, function (err, docs) {
    if (err) {
      console.log(err);
    } else {
      console.log(docs.url);
      res.redirect(docs.url);
    }
  });
});

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
// app.get("/api/hello", function (req, res) {
//   res.json({ greeting: "hello API" });
// });

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
