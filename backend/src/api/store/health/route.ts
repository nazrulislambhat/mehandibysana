import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  let dbStatus = "unknown";
  try {
    const pg = req.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION);
    if (pg) {
      await pg.raw("SELECT 1 AS health");
      dbStatus = "connected";
    }
  } catch (err: any) {
    dbStatus = `unhealthy: ${err?.message || "connection failed"}`;
    return res.status(503).json({
      status: "unhealthy",
      service: "mehandibysana-medusa-backend",
      database: dbStatus,
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
    });
  }

  return res.status(200).json({
    status: "healthy",
    service: "mehandibysana-medusa-backend",
    database: dbStatus,
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    env: process.env.NODE_ENV,
  });
}
