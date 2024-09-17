const express = require("express");
const router = require("./api");
const path = require("path");

const app = express();
app.use(express.json());

app.use(router);
app.get("/", async function (req, res) {
  res.sendFile(path.join(__dirname, "/cliff/tik.html"));
});

app.get("/ddos/site/spam", async function (req, res) {
  res.sendFile(path.join(__dirname, "/public/disk/ddos"));
});

app.get("/emojimix", async function (req, res) {
res.sendFile(path.join(__dirname, "public/disk/emojimix"));
});

app.get("/fbshare", async function (req, res) {
res.sendFile(path.join(__dirname, "public/disk/fbshare"));
});

app.get("/follow", async function (req, res) {
  res.sendFile(path.join(__dirname, "/public/disk/follow"));
});

app.get("/tempmail/gen", async function (req, res) {
res.sendFile(path.join(__dirname, "public/disk/gen"));
});

app.get("/guard", async function (req, res) {
  res.sendFile(path.join(__dirname, "/public/disk/guard"));
});

app.get("/imgur", async function (req, res) {
  res.sendFile(path.join(__dirname, "/public/disk/imgur"));
});

app.get("/lookup", async function (req, res) {
  res.sendFile(path.join(__dirname, "/public/disk/lookup"));
});

app.get("/pinterest", async function (req, res) {
  res.sendFile(path.join(__dirname, "/public/disk/pinterest"));
});

app.get("/remini", async function (req, res) {
  res.sendFile(path.join(__dirname, "/public/disk/remini"));
});

app.get("/removebg", async function (req, res) {
  res.sendFile(path.join(__dirname, "/public/disk/removebg"));
});

app.get("/sms", async function (req, res) {
  res.sendFile(path.join(__dirname, "/public/disk/sms"));
});

app.get("/translate", async function (req, res) {
  res.sendFile(path.join(__dirname, "/public/disk/trans"));
});


app.get("/tempmail/message", async function (req, res) {
  res.sendFile(path.join(__dirname, "/public/disk/message"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});