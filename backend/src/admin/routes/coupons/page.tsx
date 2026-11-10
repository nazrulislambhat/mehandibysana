import { defineRouteConfig } from "@medusajs/admin-sdk";
import { ReceiptPercent } from "@medusajs/icons";
import {
  Badge,
  Button,
  Container,
  Heading,
  Input,
  Label,
  Switch,
  Table,
  Text,
  toast,
} from "@medusajs/ui";
import { useEffect, useMemo, useState } from "react";

type CouponDiscountType = "percentage" | "fixed";
type CouponEffectiveStatus =
  | "active"
  | "scheduled"
  | "expired"
  | "limit_reached"
  | "disabled";

interface StudioCoupon {
  id: string;
  code: string;
  description: string;
  type: CouponDiscountType;
  value: number;
  targetType: "order" | "items" | "shipping_methods";
  active: boolean;
  hasExpiry: boolean;
  startsAt: string | null;
  expiresAt: string | null;
  minOrderAmount: number | null;
  maxDiscountAmount: number | null;
  usageLimit: number | null;
  usedCount: number;
  campaignId: string | null;
  effectiveStatus: CouponEffectiveStatus;
  summaryLabel: string;
  createdAt: string | null;
  updatedAt: string | null;
}

interface CouponStats {
  total: number;
  active: number;
  expiringSoon: number;
  expired: number;
  scheduled: number;
  disabled: number;
  limitReached: number;
  totalRedemptions: number;
}

interface ValidationPreview {
  valid: boolean;
  code: string;
  message: string;
  errorCode?: string;
  discountAmount?: number;
  subtotalAfterDiscount?: number;
  shippingAfterDiscount?: number;
  totalAfterDiscount?: number;
}

type FilterTab = "all" | "active" | "expiring" | "expired" | "disabled";

function toLocalDateTimeInputValue(iso: string | null | undefined): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const offsetMs = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

function localInputToIso(localStr: string): string | null {
  const trimmed = localStr.trim();
  if (!trimmed) return null;
  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString();
}

function futureLocalDateTimeInput(hoursFromNow: number): string {
  const target = new Date(Date.now() + hoursFromNow * 60 * 60 * 1000);
  const offsetMs = target.getTimezoneOffset() * 60_000;
  return new Date(target.getTime() - offsetMs).toISOString().slice(0, 16);
}

function formatDateTime(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatRemainingWindow(expiresAt: string | null): string | null {
  if (!expiresAt) return null;
  const diffMs = new Date(expiresAt).getTime() - Date.now();
  if (diffMs <= 0) return "Expired";
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  if (hours < 24) return `${Math.max(1, hours)}h left`;
  const days = Math.floor(hours / 24);
  return `${days}d ${hours % 24}h left`;
}

function getStatusBadgeProps(coupon: StudioCoupon): {
  color: "green" | "blue" | "orange" | "red" | "grey";
  label: string;
} {
  if (coupon.effectiveStatus === "disabled") {
    return { color: "grey", label: "Disabled" };
  }
  if (coupon.effectiveStatus === "expired") {
    return { color: "red", label: "Expired" };
  }
  if (coupon.effectiveStatus === "limit_reached") {
    return { color: "orange", label: "Limit Reached" };
  }
  if (coupon.effectiveStatus === "scheduled") {
    return { color: "blue", label: "Scheduled" };
  }
  if (coupon.expiresAt) {
    const remainingMs = new Date(coupon.expiresAt).getTime() - Date.now();
    if (remainingMs > 0 && remainingMs <= 72 * 60 * 60 * 1000) {
      return { color: "orange", label: "Expiring Soon" };
    }
  }
  return { color: "green", label: "Active" };
}

const CouponsAdminPage = () => {
  const [coupons, setCoupons] = useState<StudioCoupon[]>([]);
  const [stats, setStats] = useState<CouponStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [filterTab, setFilterTab] = useState<FilterTab>("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Create / Edit Form state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<CouponDiscountType>("percentage");
  const [discountValue, setDiscountValue] = useState("15");
  const [description, setDescription] = useState("");
  const [minOrderAmount, setMinOrderAmount] = useState("");
  const [maxDiscountAmount, setMaxDiscountAmount] = useState("");
  const [usageLimit, setUsageLimit] = useState("");
  const [hasExpiry, setHasExpiry] = useState(false);
  const [startsAtInput, setStartsAtInput] = useState("");
  const [expiresAtInput, setExpiresAtInput] = useState("");
  const [active, setActive] = useState(true);

  // Live Coupon Simulator state
  const [testCode, setTestCode] = useState("");
  const [testSubtotal, setTestSubtotal] = useState("180");
  const [testShipping, setTestShipping] = useState("150");
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<ValidationPreview | null>(null);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await fetch("/admin/coupons", {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Failed to load coupons.");
        return;
      }
      setCoupons(data.coupons || []);
      setStats(data.stats || null);
    } catch (err: any) {
      toast.error(err?.message || "Could not load coupons.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchCoupons();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setCode("");
    setDiscountType("percentage");
    setDiscountValue("15");
    setDescription("");
    setMinOrderAmount("");
    setMaxDiscountAmount("");
    setUsageLimit("");
    setHasExpiry(false);
    setStartsAtInput("");
    setExpiresAtInput("");
    setActive(true);
  };

  const handleEdit = (coupon: StudioCoupon) => {
    setEditingId(coupon.id);
    setCode(coupon.code);
    setDiscountType(coupon.type);
    setDiscountValue(String(coupon.value));
    setDescription(coupon.description || "");
    setMinOrderAmount(coupon.minOrderAmount ? String(coupon.minOrderAmount) : "");
    setMaxDiscountAmount(
      coupon.maxDiscountAmount ? String(coupon.maxDiscountAmount) : ""
    );
    setUsageLimit(coupon.usageLimit ? String(coupon.usageLimit) : "");
    setHasExpiry(coupon.hasExpiry);
    setStartsAtInput(toLocalDateTimeInputValue(coupon.startsAt));
    setExpiresAtInput(toLocalDateTimeInputValue(coupon.expiresAt));
    setActive(coupon.active);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedCode = code.trim().toUpperCase();
    if (!cleanedCode) {
      toast.error("Please enter a coupon code.");
      return;
    }

    const numericValue = Number(discountValue);
    if (!Number.isFinite(numericValue) || numericValue <= 0) {
      toast.error(
        discountType === "percentage"
          ? "Enter a percentage between 1 and 100."
          : "Enter a fixed discount amount greater than ₹0."
      );
      return;
    }
    if (discountType === "percentage" && numericValue > 100) {
      toast.error("Percentage discount cannot exceed 100%.");
      return;
    }

    if (hasExpiry && !expiresAtInput.trim() && !startsAtInput.trim()) {
      toast.error(
        "Choose an Expiry Date & Time (or Turn Off 'Expiring Coupon' for a never-expiring code)."
      );
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/admin/coupons", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "upsert",
          coupon: {
            id: editingId || undefined,
            code: cleanedCode,
            description: description.trim(),
            type: discountType,
            value: numericValue,
            active,
            hasExpiry,
            startsAt: hasExpiry ? localInputToIso(startsAtInput) : null,
            expiresAt: hasExpiry ? localInputToIso(expiresAtInput) : null,
            minOrderAmount: minOrderAmount.trim() ? Number(minOrderAmount) : null,
            maxDiscountAmount:
              discountType === "percentage" && maxDiscountAmount.trim()
                ? Number(maxDiscountAmount)
                : null,
            usageLimit: usageLimit.trim() ? Number(usageLimit) : null,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.message || "Could not save coupon.");
        return;
      }

      setCoupons(data.coupons || []);
      setStats(data.stats || null);
      toast.success(
        editingId
          ? `Coupon ${cleanedCode} updated.`
          : `Coupon ${cleanedCode} created.`
      );
      setTestCode(cleanedCode);
      resetForm();
    } catch (err: any) {
      toast.error(err?.message || "Failed to save coupon.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (coupon: StudioCoupon) => {
    setBusyId(coupon.id);
    try {
      const res = await fetch("/admin/coupons", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "toggle",
          id: coupon.id,
          active: !coupon.active,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.message || "Failed to toggle coupon.");
        return;
      }
      setCoupons(data.coupons || []);
      setStats(data.stats || null);
      toast.success(
        `${coupon.code} is now ${!coupon.active ? "Active" : "Paused"}.`
      );
    } finally {
      setBusyId(null);
    }
  };

  const handleDeleteCoupon = async (coupon: StudioCoupon) => {
    if (confirmDeleteId !== coupon.id) {
      setConfirmDeleteId(coupon.id);
      return;
    }

    setBusyId(coupon.id);
    try {
      const res = await fetch("/admin/coupons", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete",
          id: coupon.id,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.message || "Failed to delete coupon.");
        return;
      }
      setCoupons(data.coupons || []);
      setStats(data.stats || null);
      if (editingId === coupon.id) {
        resetForm();
      }
      setConfirmDeleteId(null);
      toast.success(`Coupon ${coupon.code} deleted.`);
    } finally {
      setBusyId(null);
    }
  };

  const handleTestCoupon = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const cleaned = testCode.trim().toUpperCase();
    if (!cleaned) {
      toast.error("Enter a coupon code to simulate.");
      return;
    }
    setTesting(true);
    try {
      const res = await fetch("/admin/coupons", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "validate_preview",
          code: cleaned,
          subtotal: Math.max(0, Number(testSubtotal) || 0),
          shippingFee: Math.max(0, Number(testShipping) || 0),
        }),
      });
      const data = await res.json();
      setTestResult(data.validation || null);
    } catch (err: any) {
      toast.error(err?.message || "Failed to simulate coupon.");
    } finally {
      setTesting(false);
    }
  };

  const filteredCoupons = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return coupons.filter((coupon) => {
      if (
        filterTab === "active" &&
        coupon.effectiveStatus !== "active"
      ) {
        return false;
      }
      if (
        filterTab === "expiring" &&
        !(
          coupon.hasExpiry &&
          (coupon.effectiveStatus === "active" ||
            coupon.effectiveStatus === "scheduled")
        )
      ) {
        return false;
      }
      if (filterTab === "expired" && coupon.effectiveStatus !== "expired") {
        return false;
      }
      if (
        filterTab === "disabled" &&
        coupon.effectiveStatus !== "disabled" &&
        coupon.effectiveStatus !== "limit_reached"
      ) {
        return false;
      }

      if (!q) return true;
      return (
        coupon.code.toLowerCase().includes(q) ||
        coupon.description.toLowerCase().includes(q) ||
        coupon.summaryLabel.toLowerCase().includes(q)
      );
    });
  }, [coupons, filterTab, searchTerm]);

  return (
    <div className="flex flex-col gap-y-6 pb-12">
      {/* Header + Stats + Simulator */}
      <Container className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Heading level="h1">Storefront Coupons &amp; Expiring Promos</Heading>
            <Text className="text-ui-fg-subtle mt-1 max-w-2xl">
              Create percentage (%) or fixed amount (₹) discount codes with optional expiry schedules,
              minimum order rules, and redemption caps. Stored natively in Medusa Promotions Postgres
              and enforced across Cart, Checkout, and Razorpay payments.
            </Text>
          </div>
          <Button variant="secondary" size="small" onClick={() => void fetchCoupons()}>
            Refresh List
          </Button>
        </div>

        {/* Summary KPI Strip */}
        <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
          <div className="rounded-lg border border-ui-border-base bg-ui-bg-subtle p-3.5">
            <Text size="xsmall" className="text-ui-fg-subtle uppercase tracking-wider">
              Active Coupons
            </Text>
            <Heading level="h2" className="mt-1 tabular-nums">
              {stats?.active ?? 0}
            </Heading>
          </div>
          <div className="rounded-lg border border-ui-border-base bg-ui-bg-subtle p-3.5">
            <Text size="xsmall" className="text-ui-fg-subtle uppercase tracking-wider">
              Expiring Soon (72h)
            </Text>
            <Heading level="h2" className="mt-1 tabular-nums">
              {stats?.expiringSoon ?? 0}
            </Heading>
          </div>
          <div className="rounded-lg border border-ui-border-base bg-ui-bg-subtle p-3.5">
            <Text size="xsmall" className="text-ui-fg-subtle uppercase tracking-wider">
              Expired / Scheduled
            </Text>
            <Heading level="h2" className="mt-1 tabular-nums">
              {(stats?.expired ?? 0) + (stats?.scheduled ?? 0)}
            </Heading>
          </div>
          <div className="rounded-lg border border-ui-border-base bg-ui-bg-subtle p-3.5">
            <Text size="xsmall" className="text-ui-fg-subtle uppercase tracking-wider">
              Total Redemptions
            </Text>
            <Heading level="h2" className="mt-1 tabular-nums">
              {stats?.totalRedemptions ?? 0}
            </Heading>
          </div>
        </div>

        {/* Live Simulator */}
        <form
          onSubmit={handleTestCoupon}
          className="mt-5 flex flex-wrap items-end gap-3 rounded-lg border border-ui-border-base bg-ui-bg-subtle p-4"
        >
          <div className="min-w-[160px] flex-1">
            <Label size="xsmall">Test Coupon Code</Label>
            <Input
              size="small"
              placeholder="e.g. EID15"
              value={testCode}
              onChange={(e) => setTestCode(e.target.value.toUpperCase())}
            />
          </div>
          <div className="w-36">
            <Label size="xsmall">Items Subtotal (₹)</Label>
            <Input
              size="small"
              type="number"
              min="0"
              value={testSubtotal}
              onChange={(e) => setTestSubtotal(e.target.value)}
            />
          </div>
          <div className="w-36">
            <Label size="xsmall">Shipping Fee (₹)</Label>
            <Input
              size="small"
              type="number"
              min="0"
              value={testShipping}
              onChange={(e) => setTestShipping(e.target.value)}
            />
          </div>
          <Button type="submit" size="small" variant="secondary" isLoading={testing}>
            Simulate Discount
          </Button>
        </form>

        {testResult && (
          <div
            className={`mt-3 rounded-lg border p-3 text-sm ${
              testResult.valid
                ? "border-emerald-500/40 bg-emerald-500/10 text-ui-fg-base"
                : "border-rose-500/40 bg-rose-500/10 text-ui-fg-base"
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span>
                <strong>{testResult.valid ? "Valid" : "Rejected"}:</strong>{" "}
                {testResult.message}
              </span>
              {testResult.valid && (
                <span className="font-mono text-xs">
                  Discount: -₹{testResult.discountAmount?.toLocaleString("en-IN")} · Final
                  Payable: ₹{testResult.totalAfterDiscount?.toLocaleString("en-IN")}
                </span>
              )}
            </div>
          </div>
        )}
      </Container>

      {/* Create / Edit Form */}
      <Container className="p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <Heading level="h2">
              {editingId ? `Edit Coupon (${code})` : "Create New Coupon"}
            </Heading>
            <Text size="small" className="text-ui-fg-subtle">
              Choose Percentage (%) or Fixed Amount (₹), optionally set an Expiry Schedule, and click Save.
            </Text>
          </div>
          {editingId && (
            <Button type="button" size="small" variant="secondary" onClick={resetForm}>
              Cancel Edit
            </Button>
          )}
        </div>

        <form onSubmit={handleSaveCoupon} className="space-y-5">
          {/* Discount Type Choice + Value */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div>
              <Label>Coupon Code *</Label>
              <Input
                placeholder="e.g. SANA15 or FLAT100"
                value={code}
                onChange={(e) =>
                  setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, ""))
                }
                maxLength={32}
                required
              />
              <Text size="xsmall" className="text-ui-fg-subtle mt-1">
                Uppercase letters, numbers, - or _
              </Text>
            </div>

            <div>
              <Label>Discount Type *</Label>
              <div className="mt-1 grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  size="small"
                  variant={discountType === "percentage" ? "primary" : "secondary"}
                  onClick={() => setDiscountType("percentage")}
                >
                  Percentage (%)
                </Button>
                <Button
                  type="button"
                  size="small"
                  variant={discountType === "fixed" ? "primary" : "secondary"}
                  onClick={() => {
                    setDiscountType("fixed");
                    setMaxDiscountAmount("");
                  }}
                >
                  Amount (₹)
                </Button>
              </div>
            </div>

            <div>
              <Label>
                {discountType === "percentage"
                  ? "Discount Percentage (%) *"
                  : "Discount Amount (₹) *"}
              </Label>
              <Input
                type="number"
                min="0.01"
                max={discountType === "percentage" ? "100" : undefined}
                step="0.01"
                placeholder={discountType === "percentage" ? "e.g. 15" : "e.g. 100"}
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                required
              />
            </div>

            <div>
              <Label>
                {discountType === "percentage"
                  ? "Max Discount Cap (₹, optional)"
                  : "Min Items Subtotal (₹, optional)"}
              </Label>
              {discountType === "percentage" ? (
                <Input
                  type="number"
                  min="1"
                  step="1"
                  placeholder="e.g. 250 (blank = no cap)"
                  value={maxDiscountAmount}
                  onChange={(e) => setMaxDiscountAmount(e.target.value)}
                />
              ) : (
                <Input
                  type="number"
                  min="1"
                  step="1"
                  placeholder="e.g. 499 (blank = any order)"
                  value={minOrderAmount}
                  onChange={(e) => setMinOrderAmount(e.target.value)}
                />
              )}
            </div>
          </div>

          {/* Rules Row */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            {discountType === "percentage" && (
              <div>
                <Label>Min Items Subtotal (₹, optional)</Label>
                <Input
                  type="number"
                  min="1"
                  step="1"
                  placeholder="e.g. 499 (blank = any order)"
                  value={minOrderAmount}
                  onChange={(e) => setMinOrderAmount(e.target.value)}
                />
              </div>
            )}

            <div>
              <Label>Usage Limit (optional)</Label>
              <Input
                type="number"
                min="1"
                step="1"
                placeholder="Blank = unlimited uses"
                value={usageLimit}
                onChange={(e) => setUsageLimit(e.target.value)}
              />
            </div>

            <div className={discountType === "percentage" ? "md:col-span-2" : "md:col-span-3"}>
              <Label>Description / Label (optional)</Label>
              <Input
                placeholder="e.g. Festive Henna Offer — 15% off cones & kits"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          {/* Expiry & Activation Section */}
          <div className="rounded-lg border border-ui-border-base bg-ui-bg-subtle p-4 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-6">
                <label className="flex items-center gap-2.5 text-sm font-medium cursor-pointer">
                  <Switch
                    checked={hasExpiry}
                    onCheckedChange={(checked) => {
                      setHasExpiry(checked);
                      if (checked && !expiresAtInput) {
                        setExpiresAtInput(futureLocalDateTimeInput(24 * 7));
                      }
                    }}
                  />
                  <span>Expiring Coupon (Set Expiry Date / Schedule)</span>
                </label>

                <label className="flex items-center gap-2.5 text-sm font-medium cursor-pointer">
                  <Switch checked={active} onCheckedChange={setActive} />
                  <span>Active on Storefront</span>
                </label>
              </div>

              {!hasExpiry && (
                <Badge color="green">Never Expires (Always Valid Until Paused)</Badge>
              )}
            </div>

            {hasExpiry && (
              <div className="grid grid-cols-1 gap-4 pt-2 border-t border-ui-border-base md:grid-cols-3 items-end">
                <div>
                  <Label>Starts At (optional)</Label>
                  <Input
                    type="datetime-local"
                    value={startsAtInput}
                    onChange={(e) => setStartsAtInput(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Expires At (Date &amp; Time) *</Label>
                  <Input
                    type="datetime-local"
                    value={expiresAtInput}
                    onChange={(e) => setExpiresAtInput(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label size="xsmall">Quick Expiry Presets</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { label: "+24 Hours", hours: 24 },
                      { label: "+3 Days", hours: 72 },
                      { label: "+7 Days", hours: 24 * 7 },
                      { label: "+30 Days", hours: 24 * 30 },
                    ].map((preset) => (
                      <Button
                        key={preset.label}
                        type="button"
                        size="small"
                        variant="secondary"
                        onClick={() => setExpiresAtInput(futureLocalDateTimeInput(preset.hours))}
                      >
                        {preset.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit" isLoading={saving}>
              {editingId ? "Update Coupon" : "Create Coupon"}
            </Button>
            {editingId && (
              <Button type="button" variant="secondary" onClick={resetForm}>
                Cancel Edit
              </Button>
            )}
          </div>
        </form>
      </Container>

      {/* Coupons List Table */}
      <Container className="p-0 overflow-hidden">
        <div className="p-6 pb-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-ui-border-base">
          <div className="flex flex-wrap items-center gap-2">
            {(
              [
                { key: "all", label: `All (${coupons.length})` },
                { key: "active", label: `Active (${stats?.active ?? 0})` },
                { key: "expiring", label: "Expiring / Scheduled" },
                { key: "expired", label: `Expired (${stats?.expired ?? 0})` },
                {
                  key: "disabled",
                  label: `Disabled / Used Up (${(stats?.disabled ?? 0) + (stats?.limitReached ?? 0)})`,
                },
              ] as Array<{ key: FilterTab; label: string }>
            ).map((tab) => (
              <Button
                key={tab.key}
                size="small"
                variant={filterTab === tab.key ? "primary" : "secondary"}
                onClick={() => setFilterTab(tab.key)}
              >
                {tab.label}
              </Button>
            ))}
          </div>

          <div className="w-full lg:w-64">
            <Input
              size="small"
              placeholder="Search code or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="p-6 text-ui-fg-subtle">Loading coupons...</div>
        ) : filteredCoupons.length === 0 ? (
          <div className="p-8 text-center text-ui-fg-subtle">
            No coupons match the current filter. Create your first coupon above.
          </div>
        ) : (
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Coupon Code</Table.HeaderCell>
                <Table.HeaderCell>Discount</Table.HeaderCell>
                <Table.HeaderCell>Min Order</Table.HeaderCell>
                <Table.HeaderCell>Expiry Schedule</Table.HeaderCell>
                <Table.HeaderCell>Redemptions</Table.HeaderCell>
                <Table.HeaderCell>Status</Table.HeaderCell>
                <Table.HeaderCell className="text-right">Actions</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {filteredCoupons.map((coupon) => {
                const statusBadge = getStatusBadgeProps(coupon);
                const remaining =
                  coupon.effectiveStatus !== "expired"
                    ? formatRemainingWindow(coupon.expiresAt)
                    : null;
                const isBusy = busyId === coupon.id;

                return (
                  <Table.Row key={coupon.id}>
                    <Table.Cell>
                      <div className="flex items-center gap-2">
                        <Badge color="purple">{coupon.code}</Badge>
                      </div>
                      {coupon.description && (
                        <div className="text-xs text-ui-fg-subtle mt-1 max-w-xs truncate">
                          {coupon.description}
                        </div>
                      )}
                    </Table.Cell>
                    <Table.Cell>
                      <div className="font-semibold">{coupon.summaryLabel}</div>
                      <div className="text-xs text-ui-fg-subtle">
                        {coupon.type === "percentage" ? "Percentage" : "Fixed Amount"}
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      {coupon.minOrderAmount
                        ? `₹${coupon.minOrderAmount.toLocaleString("en-IN")}`
                        : "None"}
                    </Table.Cell>
                    <Table.Cell>
                      {!coupon.hasExpiry ? (
                        <span className="text-xs text-ui-fg-subtle">Never expires</span>
                      ) : (
                        <div className="text-xs space-y-0.5">
                          {coupon.startsAt && (
                            <div className="text-ui-fg-subtle">
                              From: {formatDateTime(coupon.startsAt)}
                            </div>
                          )}
                          {coupon.expiresAt && (
                            <div>
                              Ends: {formatDateTime(coupon.expiresAt)}
                              {remaining ? ` (${remaining})` : ""}
                            </div>
                          )}
                        </div>
                      )}
                    </Table.Cell>
                    <Table.Cell className="tabular-nums">
                      {coupon.usedCount}
                      {coupon.usageLimit !== null ? ` / ${coupon.usageLimit}` : " / ∞"}
                    </Table.Cell>
                    <Table.Cell>
                      <Badge color={statusBadge.color}>{statusBadge.label}</Badge>
                    </Table.Cell>
                    <Table.Cell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="small"
                          variant="secondary"
                          disabled={isBusy}
                          onClick={() => void handleToggleActive(coupon)}
                        >
                          {coupon.active ? "Pause" : "Activate"}
                        </Button>
                        <Button
                          size="small"
                          variant="secondary"
                          disabled={isBusy}
                          onClick={() => handleEdit(coupon)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="small"
                          variant="danger"
                          disabled={isBusy}
                          onClick={() => void handleDeleteCoupon(coupon)}
                        >
                          {confirmDeleteId === coupon.id ? "Confirm Delete" : "Delete"}
                        </Button>
                      </div>
                    </Table.Cell>
                  </Table.Row>
                );
              })}
            </Table.Body>
          </Table>
        )}
      </Container>
    </div>
  );
};

export const config = defineRouteConfig({
  label: "Coupons",
  icon: ReceiptPercent,
});

export default CouponsAdminPage;

