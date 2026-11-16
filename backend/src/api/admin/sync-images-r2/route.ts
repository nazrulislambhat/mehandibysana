import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { syncAllImagesToR2 } from "../../../scripts/sync-images-to-r2";

export async function GET(_req: MedusaRequest, res: MedusaResponse) {
  const bucket = process.env.S3_BUCKET?.trim() || "";
  const endpoint = process.env.S3_ENDPOINT?.trim() || "";
  const publicUrl = process.env.S3_FILE_URL?.trim() || "";
  const hasAccessKey = Boolean(process.env.S3_ACCESS_KEY_ID?.trim());
  const hasSecretKey = Boolean(process.env.S3_SECRET_ACCESS_KEY?.trim());

  const configured = Boolean(bucket && endpoint && hasAccessKey && hasSecretKey);

  return res.status(200).json({
    configured,
    bucket,
    endpoint,
    publicUrl,
  });
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const body = (req.body || {}) as {
      overwrite?: boolean;
      updateProducts?: boolean;
    };

    const summary = await syncAllImagesToR2(req.scope, {
      overwrite: Boolean(body.overwrite),
      updateProducts: Boolean(body.updateProducts ?? true),
    });

    return res.status(200).json({
      success: true,
      summary,
    });
  } catch (err: any) {
    console.error("[R2 Sync API Error]:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to sync images to Cloudflare R2",
    });
  }
}
