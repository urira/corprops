const url = require('url');

require('dotenv').config();

const s3AccessKeyId = process.env.AWS_ACCESS_KEY;
const s3SecretAccessKey = process.env.AWS_SECRET_KEY;
const s3Bucket = process.env.AWS_S3_BUCKET;
const cloudfrontURL = process.env.AWS_CDN_URL

const s3 = new AWS.S3({
    accessKeyId: s3AccessKeyId,
    secretAccessKey: s3SecretAccessKey
});
// const s3Stream = require('s3-upload-stream')(s3);


var fs = require('fs');
var fileStream = fs.createReadStream('ferrari_f8.jpg');
fileStream.on('error', function (err) {
    console.log('File Error', err);
});

const filename = 'images/ferrari_f8.jpg';

mimetype = 'image/jpeg';

let params = {
    Body: fileStream,
    Bucket: s3Bucket,
    Key: filename,
    ContentType: mimetype
};

let reject = err => console.log(err);

let resolve = data => console.log('Success');



s3
    .upload(params, (err, data) => err ? reject(err) : resolve(data))
    .on('httpUploadProgress', data => {
        /* Calls after each chunk is sent (min chunk size 5Mb)
         * returns:  loaded:         Number,
         *           total:          Number,
         *           part:           Number,
         *           key:            String
         */
        console.log(JSON.stringify(data));
    });




