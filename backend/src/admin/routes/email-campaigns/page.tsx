import { defineRouteConfig } from "@medusajs/admin-sdk";
import { Envelope } from "@medusajs/icons";
import {
  Badge,
  Button,
  Container,
  Heading,
  Input,
  Label,
  Select,
  Switch,
  Table,
  Text,
  Textarea,
  toast,
} from "@medusajs/ui";
import { useCallback, useEffect, useState } from "react";

type CampaignSegment =
  | "all"
  | "repeat_buyers"
  | "kashmir_local"
  | "bridal_inquiries"
  | "one_time_buyers"
  | "newsletter";

type PreferredProvider = "auto" | "resend" | "brevo" | "smtp";

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
    storefrontUrl?: string;
    autoSendOrderConfirmation?: boolean;
    autoSendShippingEmail?: boolean;
  };
  totalRawCandidates: number;
  skippedInvalidOrTest: number;
  totalContacts: number;
  filteredCount: number;
  segmentCounts: Record<CampaignSegment, number>;
  contacts: CustomerContact[];
}

interface SanitizedEmailSettings {
  preferredProvider: PreferredProvider;
  fromEmail: string;
  adminEmail: string;
  storefrontUrl: string;
  hasResendApiKey: boolean;
  maskedResendApiKey: string;
  hasBrevoApiKey: boolean;
  maskedBrevoApiKey: string;
  smtpHost: string;
  smtpPort: number;
  smtpSecure: boolean;
  smtpUser: string;
  hasSmtpPass: boolean;
  autoSendOrderConfirmation: boolean;
  autoSendShippingEmail: boolean;
  envOverrides?: {
    hasEnvResendApiKey: boolean;
    hasEnvBrevoApiKey: boolean;
    hasEnvSmtp: boolean;
  };
  updatedAt: string | null;
}

const SEGMENT_LABELS: Record<CampaignSegment, string> = {
  all: "All Valid Customers",
  repeat_buyers: "Repeat Buyers (2+ Orders)",
  kashmir_local: "Kashmir (PIN 19xxxx)",
  bridal_inquiries: "Bridal & Event Leads",
  one_time_buyers: "One-Time Buyers",
  newsletter: "Batch List Subscribers",
};

const EmailCampaignsAdminPage = () => {
  const [segment, setSegment] = useState<CampaignSegment>("all");
  const [search, setSearch] = useState("");
  const [data, setData] = useState<EmailOverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Automated email transport settings state
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [testingTransport, setTestingTransport] = useState(false);
  const [preferredProvider, setPreferredProvider] =
    useState<PreferredProvider>("auto");
  const [fromEmail, setFromEmail] = useState(
    "Mehandi by Sana <orders@mehandibysana.com>"
  );
  const [adminEmail, setAdminEmail] = useState("");
  const [storefrontUrl, setStorefrontUrl] = useState(
    "https://mehandibysana.com"
  );
  const [resendApiKeyInput, setResendApiKeyInput] = useState("");
  const [clearResendApiKey, setClearResendApiKey] = useState(false);
  const [brevoApiKeyInput, setBrevoApiKeyInput] = useState("");
  const [clearBrevoApiKey, setClearBrevoApiKey] = useState(false);
  const [smtpHost, setSmtpHost] = useState("");
  const [smtpPort, setSmtpPort] = useState("465");
  const [smtpSecure, setSmtpSecure] = useState(true);
  const [smtpUser, setSmtpUser] = useState("");
  const [smtpPassInput, setSmtpPassInput] = useState("");
  const [clearSmtpPass, setClearSmtpPass] = useState(false);
  const [autoSendOrderConfirmation, setAutoSendOrderConfirmation] =
    useState(true);
  const [autoSendShippingEmail, setAutoSendShippingEmail] = useState(true);
  const [savedMeta, setSavedMeta] = useState<SanitizedEmailSettings | null>(
    null
  );
  const [diagnosticEmail, setDiagnosticEmail] = useState(
    "sana@mehandibysana.com"
  );
  const [transportMessage, setTransportMessage] = useState<{
    ok: boolean;
    text: string;
  } | null>(null);

  // Bulk campaign composer state
  const [testEmail, setTestEmail] = useState("sana@mehandibysana.com");
  const [subject, setSubject] = useState(
    "Freshly Rolled Organic Sojat Henna Batch Open — Mehandi by Sana"
  );
  const [bodyText, setBodyText] = useState(
    "This week's fresh organic Sojat henna paste and 0.38mm pin-tip bridal cones are freshly mixed and packed across Srinagar & Bengaluru.\n\nOrders dispatch Pan-India within 2 business days with frozen-fresh storage guidance included."
  );
  const [ctaLabel, setCtaLabel] = useState("Shop Fresh Batch");
  const [ctaUrl, setCtaUrl] = useState("https://mehandibysana.com/shop");
  const [sending, setSending] = useState(false);

  const hydrateSettingsForm = useCallback((s: SanitizedEmailSettings) => {
    setSavedMeta(s);
    setPreferredProvider(s.preferredProvider || "auto");
    setFromEmail(
      s.fromEmail || "Mehandi by Sana <orders@mehandibysana.com>"
    );
    setAdminEmail(s.adminEmail || "");
    setStorefrontUrl(s.storefrontUrl || "https://mehandibysana.com");
    setSmtpHost(s.smtpHost || "");
    setSmtpPort(String(s.smtpPort || 465));
    setSmtpSecure(Boolean(s.smtpSecure));
    setSmtpUser(s.smtpUser || "");
    setAutoSendOrderConfirmation(s.autoSendOrderConfirmation !== false);
    setAutoSendShippingEmail(s.autoSendShippingEmail !== false);
    setResendApiKeyInput("");
    setClearResendApiKey(false);
    setBrevoApiKeyInput("");
    setClearBrevoApiKey(false);
    setSmtpPassInput("");
    setClearSmtpPass(false);
    if (s.adminEmail) {
      setDiagnosticEmail((prev) => prev || s.adminEmail);
    }
    setSettingsLoaded(true);
  }, []);

  const fetchEmailSettings = useCallback(async () => {
    try {
      const res = await fetch("/admin/email-settings", {
        credentials: "include",
      });
      const json = (await res.json()) as {
        success?: boolean;
        settings?: SanitizedEmailSettings;
      };
      if (res.ok && json.settings) {
        hydrateSettingsForm(json.settings);
      }
    } catch {
      setSettingsLoaded(true);
    }
  }, [hydrateSettingsForm]);

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
    void fetchEmailSettings();
  }, [fetchEmailSettings]);

  useEffect(() => {
    void fetchContacts();
  }, [fetchContacts]);

  const buildSettingsPayload = () => ({
    preferredProvider,
    fromEmail: fromEmail.trim(),
    adminEmail: adminEmail.trim(),
    storefrontUrl: storefrontUrl.trim(),
    ...(resendApiKeyInput.trim()
      ? { resendApiKey: resendApiKeyInput.trim() }
      : {}),
    ...(clearResendApiKey ? { clearResendApiKey: true } : {}),
    ...(brevoApiKeyInput.trim()
      ? { brevoApiKey: brevoApiKeyInput.trim() }
      : {}),
    ...(clearBrevoApiKey ? { clearBrevoApiKey: true } : {}),
    smtpHost: smtpHost.trim(),
    smtpPort: Number(smtpPort) || 465,
    smtpSecure,
    smtpUser: smtpUser.trim(),
    ...(smtpPassInput.trim() ? { smtpPass: smtpPassInput.trim() } : {}),
    ...(clearSmtpPass ? { clearSmtpPass: true } : {}),
    autoSendOrderConfirmation,
    autoSendShippingEmail,
  });

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    setTransportMessage(null);
    try {
      const res = await fetch("/admin/email-settings", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save",
          ...buildSettingsPayload(),
        }),
      });
      const json = (await res.json()) as {
        success?: boolean;
        message?: string;
        settings?: SanitizedEmailSettings;
        emailProvider?: EmailOverviewResponse["emailProvider"];
      };
      if (!res.ok || !json.success) {
        toast.error(json.message || "Could not save email settings.");
        setTransportMessage({
          ok: false,
          text: json.message || "Could not save email settings.",
        });
        return;
      }
      if (json.settings) hydrateSettingsForm(json.settings);
      await fetchContacts();
      toast.success(json.message || "Email settings saved.");
      setTransportMessage({
        ok: Boolean(json.emailProvider?.configured),
        text: json.message || "Email settings saved.",
      });
    } catch (err: any) {
      toast.error(err?.message || "Failed to save email settings.");
    } finally {
      setSavingSettings(false);
    }
  };

  const [testingTemplate, setTestingTemplate] = useState<string | null>(null);

  const handleTestTransport = async (template: string = "verification") => {
    setTestingTemplate(template);
    setTestingTransport(true);
    setTransportMessage(null);
    try {
      const res = await fetch("/admin/email-settings", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "test",
          template,
          saveBeforeTest: true,
          testEmail: diagnosticEmail.trim(),
          ...buildSettingsPayload(),
        }),
      });
      const json = (await res.json()) as {
        success?: boolean;
        sent?: boolean;
        message?: string;
        error?: string;
        settings?: SanitizedEmailSettings;
        templateLabel?: string;
      };
      if (json.settings) hydrateSettingsForm(json.settings);
      await fetchContacts();
      if (json.sent) {
        toast.success(json.message || "Test email delivered.");
        setTransportMessage({
          ok: true,
          text: json.message || "Test email delivered.",
        });
      } else {
        const errText =
          json.error || json.message || "Test email delivery failed.";
        toast.error(errText);
        setTransportMessage({ ok: false, text: errText });
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to send test email.");
    } finally {
      setTestingTransport(false);
      setTestingTemplate(null);
    }
  };

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
          <Heading level="h1">
            Order Email Delivery &amp; Customer Campaigns
          </Heading>
          <Text size="small" className="text-ui-fg-subtle mt-1">
            Configure live SMTP / Resend / Brevo credentials for automated Order Confirmation &amp; Shipping emails, plus customer campaign exports.
          </Text>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge color={provider?.configured ? "green" : "orange"}>
            {provider?.configured
              ? `ACTIVE EMAIL: ${provider.provider.toUpperCase()}`
              : "EMAIL NOT CONFIGURED (LOG ONLY)"}
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

      {/* Automated Order & Shipping Email Settings */}
      <div className="px-6 py-6 bg-ui-bg-subtle/40 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <Heading level="h2">
              Automated Order &amp; Shipping Email Settings
            </Heading>
            <Text size="small" className="text-ui-fg-subtle mt-0.5">
              Saved directly in PostgreSQL so customer Order Confirmation, Payment Receipt, and Shipping / Courier emails work without redeploying.
            </Text>
          </div>
          {savedMeta?.updatedAt && (
            <Text size="xsmall" className="text-ui-fg-subtle">
              Last saved: {new Date(savedMeta.updatedAt).toLocaleString("en-IN")}
            </Text>
          )}
        </div>

        {!provider?.configured && settingsLoaded && (
          <div className="rounded-md border border-ui-tag-orange-border bg-ui-tag-orange-bg px-4 py-3">
            <Text size="small" weight="plus">
              Customers will NOT receive inbox emails until you save an email provider below.
            </Text>
            <Text size="xsmall" className="text-ui-fg-subtle mt-0.5">
              Quickest setup: create a free Resend API key at resend.com, or enter your Gmail / Hostinger / Zoho SMTP credentials below and click &ldquo;Save &amp; Send Test Email&rdquo;.
            </Text>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label size="xsmall">Preferred Provider</Label>
            <Select
              size="small"
              value={preferredProvider}
              onValueChange={(val) =>
                setPreferredProvider(val as PreferredProvider)
              }
            >
              <Select.Trigger>
                <Select.Value placeholder="Auto-detect" />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="auto">
                  Auto (Resend → Brevo → SMTP)
                </Select.Item>
                <Select.Item value="resend">Resend API</Select.Item>
                <Select.Item value="brevo">Brevo API</Select.Item>
                <Select.Item value="smtp">Custom SMTP</Select.Item>
              </Select.Content>
            </Select>
          </div>

          <div>
            <Label size="xsmall">From Email</Label>
            <Input
              size="small"
              placeholder="Mehandi by Sana <orders@mehandibysana.com>"
              value={fromEmail}
              onChange={(e) => setFromEmail(e.target.value)}
            />
          </div>

          <div>
            <Label size="xsmall">Admin BCC / Alert Email</Label>
            <Input
              size="small"
              type="email"
              placeholder="sana@mehandibysana.com"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
            />
          </div>

          <div>
            <Label size="xsmall">Storefront Tracking URL</Label>
            <Input
              size="small"
              placeholder="https://mehandibysana.com"
              value={storefrontUrl}
              onChange={(e) => setStorefrontUrl(e.target.value)}
            />
          </div>
        </div>

        {/* Auto-Send Event Toggles */}
        <div className="flex flex-wrap items-center gap-6 rounded-md border border-ui-border-base bg-ui-bg-base px-4 py-3">
          <label className="flex items-center gap-2.5 cursor-pointer">
            <Switch
              checked={autoSendOrderConfirmation}
              onCheckedChange={(v) => setAutoSendOrderConfirmation(Boolean(v))}
            />
            <span className="text-xs font-medium">
              Auto-send Confirmation Email when customer places an order
            </span>
          </label>

          <label className="flex items-center gap-2.5 cursor-pointer">
            <Switch
              checked={autoSendShippingEmail}
              onCheckedChange={(v) => setAutoSendShippingEmail(Boolean(v))}
            />
            <span className="text-xs font-medium">
              Auto-send Shipping Email when order shipment / tracking is created
            </span>
          </label>
        </div>

        {/* API Providers + SMTP Credentials */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-5 rounded-md border border-ui-border-base bg-ui-bg-base p-4 space-y-3">
            <Text size="small" weight="plus">
              API Email Providers (Resend / Brevo)
            </Text>

            <div>
              <div className="flex items-center justify-between mb-1">
                <Label size="xsmall">Resend API Key</Label>
                {savedMeta?.hasResendApiKey && (
                  <span className="text-[11px] text-ui-fg-subtle">
                    Active: {savedMeta.maskedResendApiKey || "Configured"}
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <Input
                  size="small"
                  type="password"
                  placeholder={
                    savedMeta?.hasResendApiKey
                      ? "Leave blank to keep existing key"
                      : "re_..."
                  }
                  value={resendApiKeyInput}
                  onChange={(e) => {
                    setResendApiKeyInput(e.target.value);
                    setClearResendApiKey(false);
                  }}
                />
                {savedMeta?.hasResendApiKey && !clearResendApiKey && (
                  <Button
                    size="small"
                    variant="secondary"
                    type="button"
                    onClick={() => {
                      setClearResendApiKey(true);
                      setResendApiKeyInput("");
                    }}
                  >
                    Clear
                  </Button>
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <Label size="xsmall">Brevo API Key</Label>
                {savedMeta?.hasBrevoApiKey && (
                  <span className="text-[11px] text-ui-fg-subtle">
                    Active: {savedMeta.maskedBrevoApiKey || "Configured"}
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <Input
                  size="small"
                  type="password"
                  placeholder={
                    savedMeta?.hasBrevoApiKey
                      ? "Leave blank to keep existing key"
                      : "xkeysib-..."
                  }
                  value={brevoApiKeyInput}
                  onChange={(e) => {
                    setBrevoApiKeyInput(e.target.value);
                    setClearBrevoApiKey(false);
                  }}
                />
                {savedMeta?.hasBrevoApiKey && !clearBrevoApiKey && (
                  <Button
                    size="small"
                    variant="secondary"
                    type="button"
                    onClick={() => {
                      setClearBrevoApiKey(true);
                      setBrevoApiKeyInput("");
                    }}
                  >
                    Clear
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 rounded-md border border-ui-border-base bg-ui-bg-base p-4 space-y-3">
            <div className="flex items-center justify-between">
              <Text size="small" weight="plus">
                SMTP Settings (Gmail App Password, Zoho, Hostinger, Custom)
              </Text>
              <label className="flex items-center gap-2 cursor-pointer text-xs">
                <Switch
                  checked={smtpSecure}
                  onCheckedChange={(v) => setSmtpSecure(Boolean(v))}
                />
                SSL/TLS (Port 465)
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-2">
                <Label size="xsmall">SMTP Host</Label>
                <Input
                  size="small"
                  placeholder="smtp.gmail.com or smtp.hostinger.com"
                  value={smtpHost}
                  onChange={(e) => setSmtpHost(e.target.value)}
                />
              </div>
              <div>
                <Label size="xsmall">Port</Label>
                <Input
                  size="small"
                  type="number"
                  placeholder="465"
                  value={smtpPort}
                  onChange={(e) => setSmtpPort(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label size="xsmall">SMTP Username / Email</Label>
                <Input
                  size="small"
                  placeholder="orders@mehandibysana.com"
                  value={smtpUser}
                  onChange={(e) => setSmtpUser(e.target.value)}
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <Label size="xsmall">SMTP Password / App Password</Label>
                  {savedMeta?.hasSmtpPass && (
                    <span className="text-[11px] text-ui-fg-subtle">
                      Saved
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Input
                    size="small"
                    type="password"
                    placeholder={
                      savedMeta?.hasSmtpPass
                        ? "Leave blank to keep saved password"
                        : "SMTP / App password"
                    }
                    value={smtpPassInput}
                    onChange={(e) => {
                      setSmtpPassInput(e.target.value);
                      setClearSmtpPass(false);
                    }}
                  />
                  {savedMeta?.hasSmtpPass && !clearSmtpPass && (
                    <Button
                      size="small"
                      variant="secondary"
                      type="button"
                      onClick={() => {
                        setClearSmtpPass(true);
                        setSmtpPassInput("");
                      }}
                    >
                      Clear
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
          <div className="flex flex-wrap items-end gap-2">
            <Button
              size="small"
              variant="primary"
              disabled={savingSettings || testingTransport}
              isLoading={savingSettings}
              onClick={handleSaveSettings}
            >
              Save Email Settings
            </Button>
          </div>

          <div className="flex flex-col gap-2 w-full pt-3 border-t border-ui-border-base">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <Text size="small" weight="plus">
                  Email &amp; Notification Template Diagnostics
                </Text>
                <Text size="xsmall" className="text-ui-fg-muted">
                  Test and preview each automated email template directly in your inbox.
                </Text>
              </div>
              <div className="w-72">
                <Input
                  size="small"
                  type="email"
                  placeholder="your-email@example.com"
                  value={diagnosticEmail}
                  onChange={(e) => setDiagnosticEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <Button
                size="small"
                variant="secondary"
                disabled={savingSettings || testingTransport}
                isLoading={testingTransport && testingTemplate === "customer_order"}
                onClick={() => handleTestTransport("customer_order")}
              >
                Test Customer &amp; Owner Order Email
              </Button>
              <Button
                size="small"
                variant="secondary"
                disabled={savingSettings || testingTransport}
                isLoading={testingTransport && testingTemplate === "shipping_dispatch"}
                onClick={() => handleTestTransport("shipping_dispatch")}
              >
                Test Shipping Email
              </Button>
              <Button
                size="small"
                variant="secondary"
                disabled={savingSettings || testingTransport}
                isLoading={testingTransport && testingTemplate === "password_reset"}
                onClick={() => handleTestTransport("password_reset")}
              >
                Test Password Reset Email
              </Button>
              <Button
                size="small"
                variant="secondary"
                disabled={savingSettings || testingTransport}
                isLoading={testingTransport && testingTemplate === "campaign_preview"}
                onClick={() => handleTestTransport("campaign_preview")}
              >
                Test Campaign Email
              </Button>
              <Button
                size="small"
                variant="transparent"
                disabled={savingSettings || testingTransport}
                isLoading={testingTransport && testingTemplate === "verification"}
                onClick={() => handleTestTransport("verification")}
              >
                Diagnostic Ping
              </Button>
            </div>
          </div>
        </div>

        {transportMessage && (
          <div
            className={`rounded-md border px-3 py-2 text-xs ${
              transportMessage.ok
                ? "border-ui-tag-green-border bg-ui-tag-green-bg"
                : "border-ui-tag-red-border bg-ui-tag-red-bg"
            }`}
          >
            {transportMessage.text}
          </div>
        )}
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
            For 2,000+ subscribers, export CSV to Resend Audiences or Brevo, or send a 50-recipient warm-up batch below after configuring an email provider above.
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
              disabled={
                sending ||
                !provider?.configured ||
                (data?.filteredCount ?? 0) === 0
              }
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
              Preview ({data?.contacts?.length ?? 0} of{" "}
              {data?.filteredCount ?? 0} matching)
            </Heading>
            <Text size="xsmall" className="text-ui-fg-subtle">
              Filtered {data?.skippedInvalidOrTest ?? 0} synthetic/test
              addresses
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
                      <div className="text-xs text-ui-fg-subtle">
                        {c.pincode || "—"}
                      </div>
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
