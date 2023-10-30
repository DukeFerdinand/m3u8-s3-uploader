// this script is used to upload a directory to s3 bucket

import {PutObjectCommand, S3Client} from '@aws-sdk/client-s3';
import {readdirSync, readFileSync} from "node:fs"

// create s3 client
const s3 = new S3Client({
  region: 'us-west-2',
});

// get arguments from command line to determine directory to upload
const args = Bun.argv.slice(2);
const directory = args[0];

// create params object for s3 upload

// get files from directory
const files = readdirSync(directory);

// sort files by name as these are mostly hls segments
files.sort();

if (!files.includes('index.m3u8')) {
  const warningEmoji = String.fromCodePoint(0x1F6A8);
  console.log(`${warningEmoji} No index.m3u8 file found in directory, unsure if this is a valid HLS directory`);
  process.exit(1);
}

// loop through files and upload to s3
for (const [i, file] of files.entries()) {
    const directoryName = directory.split('/').pop() || '';
    const params = {
      Bucket: 'seasidefm-vods',
      Body: new Buffer('...'),
      Key: directoryName + '/' + file
    }

    console.log(`[File ${i + 1}] Uploading ${params.Key}...`);

    // read file and upload to s3
    const fileBody = readFileSync(directory + '/' + file);
    params.Body = fileBody;

    try {
      await s3.send(new PutObjectCommand(params));
    }
    catch (err) {
      console.log(err);
      process.exit(1);
    }
}

console.log('Upload complete!');