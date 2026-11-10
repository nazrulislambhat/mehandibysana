import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import {
  aggregateCustomerEmails,
  CampaignSegment,
  toCustomerEmailsCsv,
  toCustomerEmailsTxt,
  writeCustomerEmailExports,
} from "../../../lib/customer-emails";
import { ensureStudioEmailSettingsLoaded } from "../../../lib/email-settings";
import {
  getEmailProviderStatus,
  sendBulkCampaignBatch,
} from "../../../lib/notifications";

const VALID_SEGMENTS: CampaignSegment[] = [
  "all",
  "repeat_buyers",
  "kashmir_local",
  "bridal_inquiries",
  "one_time_buyers",
  "newsletter",
];

function parseSegment(raw: unknown): CampaignSegment {
  const val = String(raw || "all").trim() as CampaignSegment;
  return VALID_SEGMENTS.includes(val) ? val : "all";
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    await ensureStudioEmailSettingsLoaded(req.scope);
    const query = (req.query || {}) as Record<string, string | undefined>;
    const segment = parseSegment(query.segment);
    const format = String(query.format || "json").toLowerCase();
    const search = String(query.search || "")
      .toLowerCase()
      .trim();
    const includeTest = query.includeTest === "true";
    const limit = Math.min(Math.max(1, Number(query.limit) || 100), 10000);

    const aggregation = await aggregateCustomerEmails(req.scope, {
      includeTest,
      segment,
    });

    const filteredContacts = search
      ? aggregation.contacts.filter(
          (c) =>
            c.email.includes(search) ||
            `${c.firstName} ${c.lastName}`.toLowerCase().includes(search) ||
            c.city.toLowerCase().includes(search) ||
            c.pincode.includes(search)
        )
      : aggregation.contacts;

    if (format === "csv") {
      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="mehandibysana-emails-${segment}.csv"`
      );
      return res.status(200).send(toCustomerEmailsCsv(filteredContacts));
    }

    if (format === "txt") {
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="mehandibysana-emails-${segment}.txt"`
      );
      return res.status(200).send(toCustomerEmailsTxt(filteredContacts));
    }

    return res.status(200).json({
      generatedAt: aggregation.generatedAt,
      emailProvider: getEmailProviderStatus(),
      segment,
      totalRawCandidates: aggregation.totalRawCandidates,
      skippedInvalidOrTest: aggregation.skippedInvalidOrTest,
      totalContacts: aggregation.totalContacts,
      filteredCount: filteredContacts.length,
      segmentCounts: aggregation.segmentCounts,
      topDomains: aggregation.topDomains,
      contacts: filteredContacts.slice(0, limit),
    });
  } catch (err: any) {
    console.error("[Admin Customer Emails GET Error]:", err);
    return res.status(500).json({
      success: false,
      message: err?.message || "Failed to load customer email directory.",
    });
  }
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const body = (req.body || {}) as {
      action?: "export" | "send-test" | "send-campaign";
      segment?: CampaignSegment;
      testEmail?: string;
      subject?: string;
      bodyText?: string;
      ctaLabel?: string;
      ctaUrl?: string;
      offset?: number;
      batchLimit?: number;
      confirmSend?: boolean;
    };

    const action = body.action || "export";
    const segment = parseSegment(body.segment);

    if (action === "export") {
      const aggregation = await aggregateCustomerEmails(req.scope, {
        includeTest: false,
        segment: "all",
      });
      const files = writeCustomerEmailExports(aggregation);
      return res.status(200).json({
        success: true,
        totalContacts: aggregation.totalContacts,
        segmentCounts: aggregation.segmentCounts,
        files,
      });
    }

    const subject = String(body.subject || "").trim();
    const bodyText = String(body.bodyText || "").trim();

    if (!subject || !bodyText) {
      return res.status(400).json({
        success: false,
        message: "Campaign subject and message body are required.",
      });
    }

    if (action === "send-test") {
      const testEmail = String(body.testEmail || "").trim();
      if (!testEmail || !testEmail.includes("@")) {
        return res.status(400).json({
          success: false,
          message: "Provide a valid testEmail address.",
        });
      }

      const result = await sendBulkCampaignBatch({
        recipients: [{ email: testEmail, firstName: "Sana Test" }],
        subject: `[TEST] ${subject}`,
        bodyText,
        ctaLabel: body.ctaLabel?.trim() || undefined,
        ctaUrl: body.ctaUrl?.trim() || undefined,
        scope: req.scope,
      });

      return res.status(result.sent > 0 ? 200 : 503).json({
        success: result.sent > 0,
        ...result,
      });
    }

    if (action === "send-campaign") {
      if (!body.confirmSend) {
        return res.status(400).json({
          success: false,
          message: "Pass confirmSend: true to authorize sending a live campaign.",
        });
      }

      const aggregation = await aggregateCustomerEmails(req.scope, {
        includeTest: false,
        segment,
      });

      const offset = Math.max(0, Number(body.offset) || 0);
      const batchLimit = Math.min(Math.max(1, Number(body.batchLimit) || 50), 250);
      const slice = aggregation.contacts.slice(offset, offset + batchLimit);

      if (slice.length === 0) {
        return res.status(200).json({
          success: true,
          attempted: 0,
          sent: 0,
          failed: 0,
          totalMatching: aggregation.contacts.length,
          message: "No remaining recipients in this offset range.",
        });
      }

      const result = await sendBulkCampaignBatch({
        recipients: slice.map((c) => ({ email: c.email, firstName: c.firstName })),
        subject,
        bodyText,
        ctaLabel: body.ctaLabel?.trim() || undefined,
        ctaUrl: body.ctaUrl?.trim() || undefined,
        scope: req.scope,
      });

      return res.status(200).json({
        success: result.sent > 0,
        totalMatching: aggregation.contacts.length,
        offset,
        nextOffset: offset + slice.length < aggregation.contacts.length ? offset + slice.length : null,
        ...result,
      });
    }

    return res.status(400).json({ success: false, message: `Unsupported action: ${action}` });
  } catch (err: any) {
    console.error("[Admin Customer Emails POST Error]:", err);
    return res.status(500).json({
      success: false,
      message: err?.message || "Failed to run customer email action.",
    });
  }
}

