const FormData = require('form-data');
const axios = require('axios');

exports.name = "/removebg";
exports.index = async (req, res) => {
    try {
        const MtxApi = ["KW4FmGpWUC6a75gRp8C6n9pB"];
        const content = req.query.url;

        if (!content) {
            return res.json({ error: "missing image input" });
        }


        const downloadedImage = await axios({
            url: content,
            responseType: 'arraybuffer'
        });

        const formData = new FormData();
        formData.append('size', 'auto');
        formData.append('image_file', Buffer.from(downloadedImage.data), 'removebg.png');

        const response = await axios({
            method: 'post',
            url: 'https://api.remove.bg/v1.0/removebg',
            data: formData,
            responseType: 'arraybuffer',
            headers: {
                ...formData.getHeaders(),
                'X-Api-Key': MtxApi[Math.floor(Math.random() * MtxApi.length)],
            },
            encoding: null
        });


        res.set('Content-Type', 'image/png');
        res.send(response.data);
    } catch (error) {
        console.error('Error:', error.message);
        res.json({ error: "An error occurred while processing your request." });
    }
};
