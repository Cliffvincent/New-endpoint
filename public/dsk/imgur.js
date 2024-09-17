const fs = require("fs");
const request = require('request');
const path = require('path');

exports.name = '/imgur';
exports.index = (req, res, next) => {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    var link = req.query.link;
    if (!link) return res.json({ error: 'Missing link data query' });

    dl(link, function(err, result) {
        if (err) {
            return res.json({ error: 'An error occurred while downloading the file' });
        }

        const { path: filePath, type } = result;

        var options = {
            method: 'POST',
            url: 'https://api.imgur.com/3/image',
            headers: {
                Authorization: 'Client-ID c76eb7edd1459f3'
            }
        };

        options.formData = type === "video" ? { 'video': fs.createReadStream(filePath) } : { 'image': fs.createReadStream(filePath) };

        request(options, function (error, response) {
            if (error) {
                return res.json({ error: 'An error occurred with your link' });
            }

            var upload = JSON.parse(response.body);

            fs.unlinkSync(filePath);

            res.json({
                uploaded: {
                    status: 'success',
                    image: upload.data.link
                }
            });
        });
    });
};

function dl(url, callback) {
    let filePath;
    request(url)
        .on('response', function(response) {
            const ext = response.headers['content-type'].split('/')[1];
            filePath = path.join(__dirname, `/cache/file.${ext}`);
            response.pipe(fs.createWriteStream(filePath))
                .on('finish', () => {
                    callback(null, { path: filePath, type: response.headers['content-type'].split('/')[0] });
                })
                .on('error', (error) => {
                    callback(error);
                });
        })
        .on('error', (error) => {
            callback(error);
        });
}
