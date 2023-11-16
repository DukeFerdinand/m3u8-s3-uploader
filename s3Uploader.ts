// this script is used to upload a directory to s3 bucket

import {readdirSync, readFileSync} from "node:fs"
import {cpus} from "node:os"

// get arguments from command line to determine directory to upload
const args = Bun.argv.slice(2);
const bucket = args[0];
const directory = args[1];
let region: string | undefined = args[2];
let doubleCpu = Boolean(args[3]);

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

if (region === "--double-cpu" || region === "-d") {
  doubleCpu = true;
  region = undefined;
}

// region is optional, default to us-west-2
if (region === undefined) {
  console.log("No region specified, defaulting to us-west-2");
  console.log(usage.replace("Usage:", "To specify a region, use:"));
  region = "us-west-2";
}

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
console.log(`Uploading ${files.length} files to ${bucket}...`);

// Get CPU count for parallel uploads
if (doubleCpu) {
  console.log("Doubling CPU count for parallel uploads");
}
const cpuCount = cpus().length * (doubleCpu ? 2 : 1);
const splitFiles = [];

// Split files into chunks for parallel uploads
for (let i = 0; i < cpuCount; i++) {
  splitFiles.push(new Array<string>());
}

// for (const file of files) {
//   const index = files.indexOf(file);
//   splitFiles[index % cpuCount].push(file);
// }

for (const [i, fileGroup] of splitFiles.entries()) {
  const worker = new Worker(new URL('worker.ts', import.meta.url).href);
  const workerId = i + 1;

  worker.addEventListener("open", () => {
    console.log(`[Worker ${workerId}] Ready to accept files!`);
  })

  worker.addEventListener("error", (err) => {
    console.log(err);
    process.exit(1);
  })

  worker.addEventListener("message", (event) => {
    if (event.data === "done") {
      worker.terminate();
    }
  })

  worker.postMessage({
    bucket,
    directory,
    files: fileGroup,
    workerId,
    region
  });
}

console.log('Upload complete!');