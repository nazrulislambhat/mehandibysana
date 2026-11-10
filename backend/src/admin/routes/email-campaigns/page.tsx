import { defineRouteConfig } from "@medusajs/admin-sdk";
import { Envelope } from "@medusajs/icons";
import {
  Badge,
  Button,
  Container,
  Heading,
  Input,
  Label,
  Table,
  Text,
  Textarea,
} from "@medusajs/ui";
import { useCallback, useEffect, useState } from "react";

type CampaignSegment =
  | "all"
  | "repeat_buyers"
  | "kashmir_local"
  | "bridal_inquiries"
  | "one_time_buyers";

interface CustomerContact {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  city: string;
  pincode: string;
  ordersCount: number;
  totalSpentInr: number;
  lastOrderAt: string;
  sources: string[];
  segments: CampaignSegment[];
}

interface EmailOverviewResponse {
  generatedAt: string;
  emailProvider: {
    configured: boolean;
    provider: "resend" | "brevo" | "smtp" | "log-only";
    fromEmail: string;
    adminEmail: string;
  };
  totalRawCandidates: number;
  skippedInvalidOrTest: number;
  totalContacts: number;
  filteredCount: number;
  segmentCounts: Record<CampaignSegment, number>;
  contacts: CustomerContact[];
}

const SEGMENT_LABELS: Record<CampaignSegment, string> = {
  all: "All Valid Customers",
  repeat_buyers: "Repeat Buyers (2+ Orders)",
  kashmir_local: "Kashmir (PIN 19xxxx)",
  bridal_inquiries: "Bridal & Event Leads",
  one_time_buyers: "One-Time Buyers",
};

const EmailCampaignsAdminPage = () => {
  const [segment, setSegment] = useState<CampaignSegment>("all");
  const [search, setSearch] = useState("");
  const [data, setData] = useState<EmailOverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const [testEmail, setTestEmail] = useState("sana@mehandibysana.com");
  const [subject, setSubject] = useState(
    "Freshly Rolled Organic Sojat Henna Batch Open — Mehandi by Sana"
  );
  const [bodyText, setBodyText] = useState(
    "This week's fresh organic Sojat henna paste and 0.38mm pin-tip bridal cones are packed straight from our Srinagar studio.\n\nOrders dispatch Pan-India within 2 business days with frozen-fresh storage guidance included."
  );
  const [ctaLabel, setCtaLabel] = useState("Shop Fresh Batch");
  const [ctaUrl, setCtaUrl] = useState("https://mehandibysana.com/shop");
  const [sending, setSending] = useState(false);

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams({
        segment,
        limit: "80",
      });
      if (search.trim()) qs.set("search", search.trim());
      const res = await fetch(`/admin/customer-emails?${qs.toString()}`, {
        credentials: "include",
      });
      const json = (await res.json()) as EmailOverviewResponse;
      setData(json);
    } finally {
      setLoading(false);
    }
  }, [segment, search]);

  useEffect(() => {
    void fetchContacts();
  }, [fetchContacts]);

  const handleExportDisk = async () => {
    setSending(true);
    setStatusMessage(null);
    try {
      const res = await fetch("/admin/customer-emails", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "export" }),
      });
      const json = await res.json();
      if (json.success) {
        setStatusMessage(
          `Saved ${json.totalContacts} contacts to studio-data/exports/customer-emails.csv`
        );
      } else {
        setStatusMessage(json.message || "Export failed.");
      }
    } finally {
      setSending(false);
    }
  };

  const handleSendTest = async () => {
    setSending(true);
    setStatusMessage(null);
    try {
      const res = await fetch("/admin/customer-emails", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "send-test",
          testEmail,
          subject,
          bodyText,
          ctaLabel,
          ctaUrl,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setStatusMessage(`Test email sent via ${json.provider} to ${testEmail}.`);
      } else {
        setStatusMessage(
          json.errors?.[0]?.error || json.message || "Could not send test email."
        );
      }
    } finally {
      setSending(false);
    }
  };

  const handleSendFirstBatch = async () => {
    const count = Math.min(data?.filteredCount ?? 0, 50);
    if (count === 0) return;
    setSending(true);
    setStatusMessage(null);
    try {
      const res = await fetch("/admin/customer-emails", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "send-campaign",
          segment,
          subject,
          bodyText,
          ctaLabel,
          ctaUrl,
          offset: 0,
          batchLimit: 50,
          confirmSend: true,
        }),
      });
      const json = await res.json();
      setStatusMessage(
        `Campaign batch finished (${json.provider}): ${json.sent ?? 0} sent, ${json.failed ?? 0} failed.`
      );
    } finally {
      setSending(false);
    }
  };

  const provider = data?.emailProvider;

  return (
    <Container className="divide-y p-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-6 py-5">
        <div>
          <Heading level="h1">Customer Email Directory &amp; Campaigns</Heading>
          <Text size="small" className="text-ui-fg-subtle mt-1">
            Deduplicated customer &amp; bridal-booking emails across Medusa orders + WooCommerce history for Resend, Brevo, or Mailchimp campaigns.
          </Text>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge color={provider?.configured ? "green" : "orange"}>
            {provider?.configured
              ? `PROVIDER: ${provider.provider.toUpperCase()}`
              : "EMAIL PROVIDER NOT CONFIGURED (LOG ONLY)"}
          </Badge>
          <a
            href={`/admin/customer-emails?segment=${segment}&format=csv`}
            download={`mehandibysana-emails-${segment}.csv`}
          >
            <Button size="small" variant="primary">
              Download CSV ({data?.filteredCount ?? 0})
            </Button>
          </a>
          <a
            href={`/admin/customer-emails?segment=${segment}&format=txt`}
            download={`mehandibysana-emails-${segment}.txt`}
          >
            <Button size="small" variant="secondary">
              Download .TXT
            </Button>
          </a>
          <Button
            size="small"
            variant="secondary"
            disabled={sending}
            onClick={handleExportDisk}
          >
            Save Snapshot to studio-data
          </Button>
        </div>
      </div>

      {statusMessage ? (
        <div className="px-6 py-3 bg-ui-bg-subtle">
          <Text size="small" weight="plus">
            {statusMessage}
          </Text>
        </div>
      ) : null}

      {/* Segments + Search */}
      <div className="px-6 py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {(Object.keys(SEGMENT_LABELS) as CampaignSegment[]).map((seg) => (
            <Button
              key={seg}
              size="small"
              variant={segment === seg ? "primary" : "secondary"}
              onClick={() => setSegment(seg)}
            >
              {SEGMENT_LABELS[seg]} ({data?.segmentCounts?.[seg] ?? 0})
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-2 w-full lg:w-72">
          <Input
            size="small"
            placeholder="Filter by email, name, city, PIN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Campaign Composer */}
      <div className="px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 space-y-4">
          <Heading level="h2">Send Test / Batch Campaign</Heading>
          <Text size="small" className="text-ui-fg-subtle">
            For 2,000+ subscribers, export CSV to Resend Audiences or Brevo, or send a 50-recipient warm-up batch below after configuring RESEND_API_KEY / BREVO_API_KEY / SMTP_*.
          </Text>
          <div>
            <Label size="small">Subject Line</Label>
            <Input
              size="small"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>
          <div>
            <Label size="small">Message Body</Label>
            <Textarea
              rows={5}
              value={bodyText}
              onChange={(e) => setBodyText(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label size="small">Button Label</Label>
              <Input
                size="small"
                value={ctaLabel}
                onChange={(e) => setCtaLabel(e.target.value)}
              />
            </div>
            <div>
              <Label size="small">Button URL</Label>
              <Input
                size="small"
                value={ctaUrl}
                onChange={(e) => setCtaUrl(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-end gap-2 pt-2">
            <div className="flex-1">
              <Label size="small">Test Recipient</Label>
              <Input
                size="small"
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
              />
            </div>
            <Button
              size="small"
              variant="secondary"
              disabled={sending}
              onClick={handleSendTest}
            >
              Send Test
            </Button>
            <Button
              size="small"
              variant="primary"
              disabled={sending || !provider?.configured || (data?.filteredCount ?? 0) === 0}
              onClick={handleSendFirstBatch}
            >
              Send Batch (50)
            </Button>
          </div>
        </div>

        {/* Directory Table Preview */}
        <div className="lg:col-span-7 overflow-x-auto">
          <div className="flex items-center justify-between mb-3">
            <Heading level="h2">
              Preview ({data?.contacts?.length ?? 0} of {data?.filteredCount ?? 0} matching)
            </Heading>
            <Text size="xsmall" className="text-ui-fg-subtle">
              Filtered {data?.skippedInvalidOrTest ?? 0} synthetic/test addresses
            </Text>
          </div>

          {loading ? (
            <Text size="small" className="text-ui-fg-subtle">
              Loading deduplicated customer emails…
            </Text>
          ) : (
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>Customer &amp; Email</Table.HeaderCell>
                  <Table.HeaderCell>Location</Table.HeaderCell>
                  <Table.HeaderCell>Orders</Table.HeaderCell>
                  <Table.HeaderCell>Spend</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {(data?.contacts || []).map((c) => (
                  <Table.Row key={c.email}>
                    <Table.Cell>
                      <div className="font-medium text-sm">
                        {`${c.firstName} ${c.lastName}`.trim() || "Customer"}
                      </div>
                      <div className="font-mono text-xs text-ui-fg-subtle">
                        {c.email}
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      <div className="text-xs">{c.city || "India"}</div>
                      <div className="text-xs text-ui-fg-subtle">{c.pincode || "—"}</div>
                    </Table.Cell>
                    <Table.Cell>
                      <Badge color={c.ordersCount >= 2 ? "green" : "grey"}>
                        {c.ordersCount}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell className="tabular-nums text-xs font-medium">
                      ₹{Math.round(c.totalSpentInr).toLocaleString("en-IN")}
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          )}
        </div>
      </div>
    </Container>
  );
};

export const config = defineRouteConfig({
  label: "Email Campaigns",
  icon: Envelope,
});

export default EmailCampaignsAdminPage;

