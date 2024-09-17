const axios = require("axios");

exports.name = "/emojimix"; 
exports.index = async (req, res) => {
    const emoji1 = req.query.emoji1;
    const emoji2 = req.query.emoji2;
    if (!emoji1 || !emoji2) {
        return res.json({ error: "Please provide both emoji1 and emoji2 parameters" });
    }
    try {
        const response = await axios.get(`https://tenor.googleapis.com/v2/featured?key=AIzaSyAyimkuYQYF_FXVALexPuGQctUWRURdCYQ&contentfilter=high&media_filter=png_transparent&component=proactive&collection=emoji_kitchen_v5&q=${encodeURIComponent(emoji1)}_${encodeURIComponent(emoji2)}`);
        const image = response.data.results[0].url;
        const imageBuffer = await axios.get(image, { responseType: 'arraybuffer' });

        const buffer = Buffer.from(imageBuffer.data, 'binary');
        res.set('Content-Type', 'image/jpeg');
        res.send(buffer);
    } catch (error) {
        console.error(error);
        res.status(500).send("An error occurred");
    }
};
