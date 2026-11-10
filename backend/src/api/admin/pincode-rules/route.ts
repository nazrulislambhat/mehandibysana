import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import {
  loadPincodeRules,
  normalizePattern,
  PincodeRule,
  resetDefaultPincodeRules,
  savePincodeRules,
} from "../../../lib/pincode-rules";

export async function GET(_req: MedusaRequest, res: MedusaResponse) {
  const rules = loadPincodeRules();
  return res.status(200).json({ rules });
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const body = (req.body || {}) as Record<string, any>;
  const action = String(body.action || "upsert");

  if (action === "reset") {
    const rules = resetDefaultPincodeRules();
    return res.status(200).json({ rules });
  }

  const current = loadPincodeRules();

  if (action === "delete") {
    const targetId = String(body.id || "").trim();
    if (!targetId) {
      return res.status(400).json({ error: "Rule id is required to delete." });
    }
    const updated = savePincodeRules(current.filter((r) => r.id !== targetId));
    return res.status(200).json({ rules: updated });
  }

  // Default: upsert rule
  const rawRule = body.rule || body;
  const normalizedPattern = normalizePattern(String(rawRule.pattern || ""));
  if (!normalizedPattern) {
    return res
      .status(400)
      .json({ error: "Valid PIN or prefix wildcard (e.g. 19*, 190001, *) is required." });
  }

  const now = new Date().toISOString();
  const charge = Math.max(0, Number(rawRule.charge) || 0);
  const thresholdRaw = rawRule.freeShippingAbove;
  const freeShippingAbove =
    thresholdRaw !== null && thresholdRaw !== undefined && Number(thresholdRaw) > 0
      ? Number(thresholdRaw)
      : null;

  const existingIndex = current.findIndex(
    (r) =>
      (rawRule.id && r.id === rawRule.id) ||
      r.pattern.toUpperCase() === normalizedPattern.toUpperCase()
  );

  const nextRule: PincodeRule = {
    id:
      (existingIndex >= 0 ? current[existingIndex].id : rawRule.id) ||
      `rule-${normalizedPattern.replace(/\*/g, "star").toLowerCase()}-${Date.now()}`,
    pattern: normalizedPattern,
    label: String(rawRule.label || `Pincode ${normalizedPattern}`).trim(),
    zone: String(rawRule.zone || `Delivery Zone (${normalizedPattern})`).trim(),
    charge,
    estimatedDays: String(rawRule.estimatedDays || "3–5 business days").trim(),
    codAvailable: rawRule.codAvailable !== undefined ? Boolean(rawRule.codAvailable) : true,
    freeShippingAbove,
    active: rawRule.active !== undefined ? Boolean(rawRule.active) : true,
    updatedAt: now,
  };

  if (existingIndex >= 0) {
    current[existingIndex] = nextRule;
  } else {
    current.unshift(nextRule);
  }

  const saved = savePincodeRules(current);
  return res.status(200).json({ rules: saved, rule: nextRule });
}


