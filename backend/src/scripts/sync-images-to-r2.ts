import fs from "node:fs";
import path from "node:path";
import { S3Client, PutObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";

export interface R2SyncSummary {
  bucket: string;
  endpoint: string;
  totalFound: number;
  uploadedCount: number;
  skippedCount: number;
  failedCount: number;
  updatedProductsCount: number;
  files: Array<{ key: string; status: "uploaded" | "skipped" | "failed"; error?: string }>;
}

function getContentType(filePathOrUrl: string): string {
  const ext = path.extname(filePathOrUrl).toLowerCase();
  switch (ext) {
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    case ".webp":
      return "image/webp";
    case ".svg":
      return "image/svg+xml";
    case ".gif":
      return "image/gif";
    case ".ico":
      return "image/x-icon";
    default:
      return "application/octet-stream";
  }
}

export function createR2Client() {
  const bucket = process.env.S3_BUCKET?.trim();
  const accessKeyId = process.env.S3_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY?.trim();
  const endpoint = process.env.S3_ENDPOINT?.trim();
  const region = process.env.S3_REGION?.trim() || "auto";
  const publicFileUrl = process.env.S3_FILE_URL?.trim();

  if (!bucket || !accessKeyId || !secretAccessKey || !endpoint) {
    throw new Error(
      "Missing Cloudflare R2 / S3 configuration. Please set S3_BUCKET, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, and S3_ENDPOINT."
    );
  }

  const client = new S3Client({
    region,
    endpoint,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
    forcePathStyle: true,
  });

  return { client, bucket, endpoint, publicFileUrl };
}

async function uploadBufferToR2(
  client: S3Client,
  bucket: string,
  key: string,
  body: Buffer,
  contentType: string,
  overwrite = false
): Promise<"uploaded" | "skipped"> {
  if (!overwrite) {
    try {
      await client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
      return "skipped";
    } catch {
      // Object doesn't exist, proceed with upload
    }
  }

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000, immutable",
    })
  );

  return "uploaded";
}

export async function syncAllImagesToR2(
  scope?: { resolve: (key: string) => any },
  options: { overwrite?: boolean; updateProducts?: boolean } = {}
): Promise<R2SyncSummary> {
  const { client, bucket, endpoint, publicFileUrl } = createR2Client();

  const summary: R2SyncSummary = {
    bucket,
    endpoint,
    totalFound: 0,
    uploadedCount: 0,
    skippedCount: 0,
    failedCount: 0,
    updatedProductsCount: 0,
    files: [],
  };

  // 1. Gather local frontend images
  const localDirs = [
    { dir: path.resolve(process.cwd(), "../frontend/public/images/tools"), prefix: "tools/" },
    { dir: path.resolve(process.cwd(), "frontend/public/images/tools"), prefix: "tools/" },
    { dir: path.resolve(process.cwd(), "../frontend/public/brand"), prefix: "brand/" },
    { dir: path.resolve(process.cwd(), "frontend/public/brand"), prefix: "brand/" },
    { dir: path.resolve(process.cwd(), "../frontend/public/icons"), prefix: "icons/" },
    { dir: path.resolve(process.cwd(), "frontend/public/icons"), prefix: "icons/" },
  ];

  const processedKeys = new Set<string>();

  for (const item of localDirs) {
    if (!fs.existsSync(item.dir)) continue;

    const files = fs.readdirSync(item.dir);
    for (const file of files) {
      const fullPath = path.join(item.dir, file);
      if (!fs.statSync(fullPath).isFile()) continue;

      const r2Key = `${item.prefix}${file}`;
      if (processedKeys.has(r2Key)) continue;
      processedKeys.add(r2Key);

      summary.totalFound++;
      try {
        const fileBuffer = fs.readFileSync(fullPath);
        const contentType = getContentType(file);
        const status = await uploadBufferToR2(
          client,
          bucket,
          r2Key,
          fileBuffer,
          contentType,
          options.overwrite
        );

        if (status === "uploaded") {
          summary.uploadedCount++;
        } else {
          summary.skippedCount++;
        }
        summary.files.push({ key: r2Key, status });
      } catch (err: any) {
        summary.failedCount++;
        summary.files.push({ key: r2Key, status: "failed", error: err.message });
        console.warn(`[R2 Sync] Failed to upload local file ${r2Key}:`, err.message);
      }
    }
  }

  // 2. Query Medusa Products and sync remote product images to R2
  if (scope) {
    try {
      const query = scope.resolve(ContainerRegistrationKeys.QUERY);
      const productService = scope.resolve(Modules.PRODUCT);

      const { data: products } = await query.graph({
        entity: "product",
        fields: ["id", "title", "thumbnail", "images.*"],
      });

      for (const prod of products || []) {
        let productNeedsUpdate = false;
        let newThumbnail = prod.thumbnail;

        // Sync thumbnail
        if (prod.thumbnail && typeof prod.thumbnail === "string") {
          const rawUrl = prod.thumbnail.trim();
          if (rawUrl.startsWith("http")) {
            const urlObj = new URL(rawUrl);
            const fileName = path.basename(urlObj.pathname);
            const r2Key = `products/${fileName}`;

            summary.totalFound++;
            try {
              let status: "uploaded" | "skipped" = "skipped";
              if (options.overwrite || !(await objectExists(client, bucket, r2Key))) {
                const imgRes = await fetch(rawUrl);
                if (imgRes.ok) {
                  const arrayBuf = await imgRes.arrayBuffer();
                  const buf = Buffer.from(arrayBuf);
                  const contentType = imgRes.headers.get("content-type") || getContentType(fileName);
                  status = await uploadBufferToR2(client, bucket, r2Key, buf, contentType, true);
                }
              }

              if (status === "uploaded") {
                summary.uploadedCount++;
              } else {
                summary.skippedCount++;
              }
              summary.files.push({ key: r2Key, status });

              if (publicFileUrl && options.updateProducts) {
                newThumbnail = `${publicFileUrl.replace(/\/$/, "")}/${r2Key}`;
                productNeedsUpdate = true;
              }
            } catch (dlErr: any) {
              summary.failedCount++;
              summary.files.push({ key: r2Key, status: "failed", error: dlErr.message });
            }
          }
        }

        // Update product in Medusa if requested
        if (productNeedsUpdate && newThumbnail && productService?.updateProducts) {
          try {
            await productService.updateProducts(prod.id, { thumbnail: newThumbnail });
            summary.updatedProductsCount++;
          } catch (updateErr) {
            console.warn(`[R2 Sync] Non-fatal product update warning for ${prod.id}:`, updateErr);
          }
        }
      }
    } catch (dbErr) {
      console.warn("[R2 Sync] Non-fatal warning querying Medusa products:", dbErr);
    }
  }

  return summary;
}

async function objectExists(client: S3Client, bucket: string, key: string): Promise<boolean> {
  try {
    await client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    return true;
  } catch {
    return false;
  }
}

export default async function run({ container }: { container: any }) {
  console.log("🚀 Starting Cloudflare R2 Image Synchronization...");
  try {
    const summary = await syncAllImagesToR2(container, {
      overwrite: false,
      updateProducts: Boolean(process.env.S3_FILE_URL),
    });

    console.log("✅ Cloudflare R2 Sync Complete!");
    console.log(`• Bucket: ${summary.bucket}`);
    console.log(`• Total Assets Found: ${summary.totalFound}`);
    console.log(`• Successfully Uploaded: ${summary.uploadedCount}`);
    console.log(`• Already Existed (Skipped): ${summary.skippedCount}`);
    console.log(`• Failed: ${summary.failedCount}`);
    if (summary.updatedProductsCount > 0) {
      console.log(`• Medusa Products Updated: ${summary.updatedProductsCount}`);
    }
  } catch (err: any) {
    console.error("❌ Cloudflare R2 Sync Error:", err.message);
  }
}
