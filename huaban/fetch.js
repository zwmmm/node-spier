const request = require('request');
const zlib = require('zlib');
const fs = require('fs');

function fetch(url) {
    return new Promise((resolve, reject) => {
        request.get(
            {
                url,
                encoding: null,
                headers: {
                    'Host': 'huaban.com',
                    'Connection': 'keep-alive',
                    'Pragma': 'no-cache',
                    'Cache-Control': 'no-cache',
                    'Accept': 'application/json',
                    'Accept-Encoding': 'gzip',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-Request': 'JSON',
                    'Referer': 'http://huaban.com/',
                    "content-type": "application/json",
                }
            },
            (error, response, body) => {
                if (error) {
                    fs.writeFileSync('/logs/huaban.error.log', error);
                    reject(error)
                    return;
                }
                // 需要解压
                zlib.unzip(body, (err, buffer) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(JSON.parse(buffer.toString()));
                })
            }
        )
    })
}

module.exports = fetch；
