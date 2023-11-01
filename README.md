# S3 Uploader using Bun

This simple script allows you to upload the contents of a local directory to an Amazon S3 bucket using the AWS SDK for JavaScript (v3) and Bun.js. It's particularly useful for uploading HLS (HTTP Live Streaming) segments to S3. 

## Prerequisites

Before using this script, ensure that you have the following dependencies and AWS credentials set up:

- Node.js installed on your system.
- Bun installed on your system.
- An Amazon S3 bucket created for the uploads.
- Appropriate AWS credentials configured with access to the S3 bucket.
- A local directory with an `index.m3u8` file and its corresponding media segments.

## Installation

1. Clone or download this repository to your local machine.

2. Install the required dependencies by running the following command in the project directory:

    ```bash
    bun install
    ```

## Usage

To use the S3 uploader script, execute it from the command line with the following arguments:

```bash
bun run s3Uploader.js <bucket> <directory> [<region>]
```

- `<bucket>`: The name of the Amazon S3 bucket to which you want to upload the directory contents.
- `<directory>`: The local directory whose contents you want to upload.
- `[<region>]` (optional): The AWS region where the S3 bucket is located. If not specified, it defaults to `us-west-2`.

### Example Usage

```bash
bun run s3Uploader.js my-s3-bucket ./my-local-directory us-east-1
```

## Script Explanation

The script performs the following tasks:

1. Parses command line arguments and checks for proper usage.

2. Initializes the AWS S3 client using the specified or default region.

3. Reads the files in the local directory and sorts them by name.

4. Checks if an `index.m3u8` file exists in the directory. This file is commonly found in HLS directories and is used to verify that the directory is an HLS directory.

5. Loops through the files in the directory, reads each file, and uploads it to the specified S3 bucket using the AWS SDK for JavaScript (v3).

6. Displays progress messages for each file being uploaded.

7. If an error occurs during the upload process, the script logs the error and exits with an error code.

8. Upon successful completion, the script prints "Upload complete!" to the console.

## Notes

- Be cautious while uploading large files or directories, as AWS may charge you for storage and data transfer fees.
  <i><b>I am not responsible for any charges incurred by using this script.</b></i>

- Ensure that you have proper AWS credentials configured to allow the script to access the specified S3 bucket.

- Make sure that the AWS SDK for JavaScript (v3) is correctly installed and configured on your system.

- The script uses a default region of `us-west-2` if not provided.

- The script assumes that the local directory and S3 bucket exist and are accessible with the configured AWS credentials.



## License

This script is provided under the [MIT License](LICENSE). Feel free to modify and use it according to your requirements.

If you encounter any issues or have questions, please open an issue in the repository or contact the script's author.