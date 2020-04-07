const url = require('url');
const AWS = require('aws-sdk');

const s3AccessKeyId = proc.env.AWS_ACCESS_KEY;
const s3SecretAccessKey = proc.env.AWS_SECRET_KEY;
const s3Bucket = proc.env.AWS_S3_BUCKET;
const cloudfrontURL = proc.env.AWS_CDN_URL

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

const filename = 'ferrari_f8.jpg';


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
        fileModel.size = data.total;
        console.log(JSON.stringify(data));
    });




