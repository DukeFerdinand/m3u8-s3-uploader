import {PutObjectCommand, S3Client} from "@aws-sdk/client-s3";
import {readFileSync} from "node:fs";

declare var self: Worker;

if (Bun.isMainThread) {
  throw new Error("This file should not be imported in the main thread");
}

self.onmessage = async (event: MessageEvent) => {
  console.log(event.data);

  const {bucket, directory, region, files, workerId} = event.data;
  console.log(`[Worker ${workerId}] received ${files.length} files to upload to ${bucket}...`);

  const s3 = new S3Client({
    region,
  });

  for (const [i, file] of files.entries()) {
    const directoryName = directory.split('/').pop() || '';
    const params = {
      Bucket: bucket,
      Body: new Buffer('...'),
      Key: directoryName + '/' + file
    }

    console.log(`[Worker ${workerId}] Uploading file ${i + 1}/${files.length}...`);

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

  self.postMessage(`[Worker ${workerId}] Finished uploading ${files.length} files to ${bucket}. Shutting down worker...`);

  await new Promise(resolve => setTimeout(resolve, 1000));
  self.terminate();
}