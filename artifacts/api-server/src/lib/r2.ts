import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const accountId = process.env.R2_ACCOUNT_ID!;
const bucketName = process.env.R2_BUCKET_NAME!;
const publicUrl = (process.env.R2_PUBLIC_URL ?? "").replace(/\/$/, "");

export const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export async function uploadToR2(
  key: string,
  body: Buffer,
  contentType: string,
): Promise<string> {
  await r2.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  );

  // Return the public URL if configured, otherwise a presigned URL (1 day)
  if (publicUrl) {
    return `${publicUrl}/${key}`;
  }

  const signed = await getSignedUrl(
    r2,
    new PutObjectCommand({ Bucket: bucketName, Key: key }),
    { expiresIn: 86400 },
  );
  // Return the object URL without query params for storage
  return signed.split("?")[0];
}

export async function deleteFromR2(key: string): Promise<void> {
  await r2.send(new DeleteObjectCommand({ Bucket: bucketName, Key: key }));
}

/** Extract R2 object key from a stored URL */
export function keyFromUrl(url: string): string {
  if (publicUrl && url.startsWith(publicUrl)) {
    return url.slice(publicUrl.length + 1);
  }
  // fallback: last two path segments (folder/filename)
  const parts = new URL(url).pathname.split("/").filter(Boolean);
  return parts.slice(-2).join("/");
}
