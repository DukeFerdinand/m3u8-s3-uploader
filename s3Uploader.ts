// this script is used to upload a directory to s3 bucket

import {PutObjectCommand, S3Client} from '@aws-sdk/client-s3';
import {readdirSync, readFileSync} from "node:fs"

// get arguments from command line to determine directory to upload
const args = Bun.argv.slice(2);
const bucket = args[0];
const directory = args[1];
let region = args[2];

const usage = "Usage: bun run s3Uploader.js <bucket> <directory> [<region>]";

if (!bucket || bucket === "--help" || bucket === "-h") {
  console.log(usage);
  process.exit(1);
}

if (!directory || directory === "--help" || directory === "-h") {
  console.log(usage);
  process.exit(1);
}

if (region === "--help" || region === "-h") {
  console.log(usage);
  process.exit(1);
}

// region is optional, default to us-west-2
if (region === undefined) {
  console.log("No region specified, defaulting to us-west-2");
  console.log(usage.replace("Usage:", "To specify a region, use:"));
  region = "us-west-2";
}

// create s3 client
const s3 = new S3Client({
  region,
});

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
      Bucket: bucket,
      Body: new Buffer('...'),
      Key: directoryName + '/' + file
    }

    console.log(`[File ${i + 1}] Uploading ${params.Key}...`);

    // read file and upload to s3
    params.Body = readFileSync(directory + '/' + file);

    try {
      await s3.send(new PutObjectCommand(params));
    }
    catch (err) {
      console.log(err);
      process.exit(1);
    }
}

console.log('Upload complete!');