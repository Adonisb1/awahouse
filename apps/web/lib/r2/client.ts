const r2AccessKey = process.env.R2_ACCESS_KEY_ID;
const r2SecretKey = process.env.R2_SECRET_ACCESS_KEY;
const r2BucketName = process.env.R2_BUCKET_NAME;
const r2AccountId = process.env.R2_ACCOUNT_ID;

export function isR2Configured(): boolean {
  return !!(r2AccessKey && r2SecretKey && r2BucketName && r2AccountId);
}

export async function uploadFile(
  key: string,
  buffer: Buffer,
  contentType: string,
): Promise<string> {
  if (isR2Configured()) {
    try {
      const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3');
      const s3 = new S3Client({
        region: 'auto',
        endpoint: `https://${r2AccountId}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId: r2AccessKey!,
          secretAccessKey: r2SecretKey!,
        },
      });
      await s3.send(
        new PutObjectCommand({
          Bucket: r2BucketName!,
          Key: key,
          Body: buffer,
          ContentType: contentType,
        }),
      );
      return key;
    } catch (error) {
      console.error('R2 upload error:', error);
      return key;
    }
  }

  console.log(`[STUB R2] Uploaded: ${key} (${contentType})`);
  return key;
}

export async function getSignedUrl(key: string): Promise<string | null> {
  if (isR2Configured()) {
    try {
      const { S3Client, GetObjectCommand } = await import('@aws-sdk/client-s3');
      const { getSignedUrl: s3Sign } = await import('@aws-sdk/s3-request-presigner');
      const s3 = new S3Client({
        region: 'auto',
        endpoint: `https://${r2AccountId}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId: r2AccessKey!,
          secretAccessKey: r2SecretKey!,
        },
      });
      const url = await s3Sign(
        s3,
        new GetObjectCommand({ Bucket: r2BucketName!, Key: key }),
        { expiresIn: 600 },
      );
      return url;
    } catch (error) {
      console.error('R2 signed URL error:', error);
      return null;
    }
  }

  const publicUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
  if (publicUrl) {
    return `${publicUrl}/${key}`;
  }

  return `https://r2-stub.local/${key}`;
}
