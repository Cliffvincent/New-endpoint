const { remini } = require("betabotz-tools");
const axios = require("axios");

exports.name = "/remini"; 
exports.index = async (req, res) => {
  try {
    const inputImage = req.query.url;

    if (!inputImage) {
      return res.status(400).send({ error: "Missing input image URL" });
    }

    const result = await remini(inputImage);
    const image = result.image_data;


    const response = await axios.get(image, { responseType: "arraybuffer" });

    res.setHeader('Content-Type', 'image/jpeg');
    res.send(Buffer.from(response.data));

  } catch (error) {
    console.error("Error calling Remini API:", error.message);
    res.status(error.response?.status || 500).send({
      error: "Internal Server Error",
      details: error.message,
    });
  }
};
