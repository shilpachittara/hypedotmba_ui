import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import { IncomingForm } from "formidable";
import fs from "fs";

// Disable Next.js default body parser for file upload
export const config = {
  api: {
    bodyParser: false,
  },
};

// AWS S3 Configuration
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const form = new IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Error parsing form:", err);
      return res.status(500).json({ error: "Form parsing failed" });
    }

    const file = files.file[0];
    const fileContent = fs.readFileSync(file.filepath);

    const uploadParams = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `uploads/${uuidv4()}_${file.originalFilename}`,
      Body: fileContent,
      ContentType: file.mimetype,  // Correct content type for the file
    };

    try {
      await s3.send(new PutObjectCommand(uploadParams));
      const imageUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${uploadParams.Key}`;
      res.status(200).json({ imageUrl });
    } catch (uploadErr) {
      console.error("S3 Upload Error:", uploadErr);
      res.status(500).json({ error: "Upload to S3 failed" });
    }
  });
}