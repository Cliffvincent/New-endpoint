const express = require("express");
const router = require("./api");
const path = require("path");
const axios = require("axios");

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


const UNSPLASH_ACCESS_KEY = 'RZEIOVfPhS7vMLkFdd2TSKGFBS4o9_FmcV1Nje3FSjw';

app.get('/unsplash', async (req, res) => {
  const search = req.query.search;
  let count = parseInt(req.query.count) || 1;

  if (!search) {
    return res.status(400).json({ error: 'Search query is required' });
  }

  count = Math.min(count, 5);

  const url = `https://api.unsplash.com/search/photos?query=${search}&per_page=${count}&client_id=${UNSPLASH_ACCESS_KEY}`;

  try {
    const response = await axios.get(url);
    const cleanData = response.data.results.map((image) => ({
      id: image.id,
      description: image.description || 'No description available',
      alt_description: image.alt_description,
      urls: image.urls,
      user: {
        name: image.user.name,
        portfolio_url: image.user.portfolio_url,
      },
    }));

    res.json(cleanData);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching data from Unsplash' });
  }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
