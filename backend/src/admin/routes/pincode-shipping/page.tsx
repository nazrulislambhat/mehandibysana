import { defineRouteConfig } from "@medusajs/admin-sdk";
import { MapPin } from "@medusajs/icons";
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
} from "@medusajs/ui";
import { useEffect, useState } from "react";

interface PincodeRule {
  id: string;
  pattern: string;
  label: string;
  zone: string;
  charge: number;
  estimatedDays: string;
  codAvailable: boolean;
  freeShippingAbove: number | null;
  active: boolean;
  updatedAt: string;
}

const PincodeShippingPage = () => {
  const [rules, setRules] = useState<PincodeRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state for adding/editing a rule
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pattern, setPattern] = useState("");
  const [label, setLabel] = useState("");
  const [zone, setZone] = useState("");
  const [charge, setCharge] = useState("60");
  const [estimatedDays, setEstimatedDays] = useState("2–4 business days");
  const [codAvailable, setCodAvailable] = useState(true);
  const [freeShippingAbove, setFreeShippingAbove] = useState("");
  const [active, setActive] = useState(true);

  // Studio Pickup settings state
  const [enableSrinagarPickup, setEnableSrinagarPickup] = useState(true);
  const [enableBengaluruPickup, setEnableBengaluruPickup] = useState(true);
  const [savingPickup, setSavingPickup] = useState(false);
  const [pickupSavedNotice, setPickupSavedNotice] = useState(false);

  // Live Pincode Simulator
  const [testPin, setTestPin] = useState("190001");
  const [testResult, setTestResult] = useState<any>(null);

  const fetchPickupSettings = async () => {
    try {
      const res = await fetch("/admin/pickup-settings", {
        credentials: "include",
      });
      const data = await res.json();
      if (data.settings) {
        setEnableSrinagarPickup(Boolean(data.settings.enableSrinagarPickup));
        setEnableBengaluruPickup(Boolean(data.settings.enableBengaluruPickup));
      }
    } catch (err) {
      console.warn("Could not load pickup settings:", err);
    }
  };

  const handleSavePickupSettings = async () => {
    setSavingPickup(true);
    setPickupSavedNotice(false);
    try {
      const res = await fetch("/admin/pickup-settings", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enableSrinagarPickup,
          enableBengaluruPickup,
        }),
      });
      if (res.ok) {
        setPickupSavedNotice(true);
        setTimeout(() => setPickupSavedNotice(false), 3000);
      }
    } finally {
      setSavingPickup(false);
    }
  };

  const fetchRules = async () => {
    setLoading(true);
    try {
      const res = await fetch("/admin/pincode-rules", {
        credentials: "include",
      });
      const data = await res.json();
      setRules(data.rules || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
    fetchPickupSettings();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setPattern("");
    setLabel("");
    setZone("");
    setCharge("60");
    setEstimatedDays("2–4 business days");
    setCodAvailable(true);
    setFreeShippingAbove("");
    setActive(true);
  };

  const handleEdit = (rule: PincodeRule) => {
    setEditingId(rule.id);
    setPattern(rule.pattern);
    setLabel(rule.label);
    setZone(rule.zone);
    setCharge(String(rule.charge));
    setEstimatedDays(rule.estimatedDays);
    setCodAvailable(rule.codAvailable);
    setFreeShippingAbove(rule.freeShippingAbove ? String(rule.freeShippingAbove) : "");
    setActive(rule.active);
  };

  const handleSaveRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pattern.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/admin/pincode-rules", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "upsert",
          rule: {
            id: editingId || undefined,
            pattern: pattern.trim(),
            label: label.trim() || `Pincode ${pattern.trim()}`,
            zone: zone.trim() || `Delivery Zone (${pattern.trim()})`,
            charge: Number(charge) || 0,
            estimatedDays: estimatedDays.trim() || "3–5 business days",
            codAvailable,
            freeShippingAbove: freeShippingAbove ? Number(freeShippingAbove) : null,
            active,
          },
        }),
      });
      const data = await res.json();
      if (data.rules) {
        setRules(data.rules);
        resetForm();
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const res = await fetch("/admin/pincode-rules", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", id }),
    });
    const data = await res.json();
    if (data.rules) setRules(data.rules);
  };

  const handleTestPincode = async () => {
    const res = await fetch(
      `/admin/pincode-rules?pincode=${encodeURIComponent(testPin)}`,
      { credentials: "include" }
    );
    const data = await res.json();
    setTestResult(data.checkResult || data);
  };

  return (
    <div className="flex flex-col gap-y-6 pb-12">
      <Container className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Heading level="h1">Wildcard Pincode Delivery Rates</Heading>
            <Text className="text-ui-fg-subtle mt-1">
              Configure prefix wildcards (e.g. <code>190*</code> for Kashmir PINs at ₹60,{" "}
              <code>560*</code> for Bengaluru PINs at ₹60, or <code>*</code> for Pan-India at ₹120). Most specific prefix wins.
            </Text>
          </div>
          <div className="flex items-center gap-2">
            <Input
              placeholder="Test 6-digit PIN"
              value={testPin}
              onChange={(e) => setTestPin(e.target.value)}
              className="w-36"
            />
            <Button variant="secondary" onClick={handleTestPincode}>
              Test PIN
            </Button>
          </div>
        </div>
        {testResult && (
          <div className="mt-4 rounded-lg border border-ui-border-base bg-ui-bg-subtle p-3 text-sm">
            <strong>Result for {testResult.pincode}:</strong> {testResult.message} (COD:{" "}
            {testResult.codAvailable ? "Yes" : "No"})
            {testResult.isPickupEligible !== undefined && (
              <span className="ml-2 font-medium">
                · Pickup: {testResult.isPickupEligible ? `✅ Available (${testResult.pickupLocationName || "Active"})` : "❌ Disabled / Delivery Only"}
              </span>
            )}
          </div>
        )}
      </Container>

      {/* Studio Self-Pickup Availability Controls */}
      <Container className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Heading level="h2">Studio Self-Pickup Locations &amp; Availability</Heading>
              <Badge color="orange">Storefront Checkout Control</Badge>
            </div>
            <Text className="text-ui-fg-subtle mt-1 text-sm max-w-2xl">
              Enable or disable Studio Self-Pickup independently for Srinagar and Bengaluru. If enabled, customers in that region can choose between Doorstep Delivery and Studio Self-Pickup (Free). If disabled, only Doorstep Delivery is offered. All other Indian PIN codes always see Doorstep Delivery only.
            </Text>
          </div>
          <div className="flex items-center gap-3">
            {pickupSavedNotice && (
              <Badge color="green">Saved to Storefront</Badge>
            )}
            <Button
              variant="primary"
              size="small"
              isLoading={savingPickup}
              onClick={handleSavePickupSettings}
            >
              Save Pickup Availability
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Srinagar Card */}
          <div className="p-4 rounded-xl border border-ui-border-base bg-ui-bg-subtle flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-ui-fg-base flex items-center gap-1.5">
                  🏔️ Srinagar Studio (Kashmir)
                </span>
                <Badge color={enableSrinagarPickup ? "green" : "grey"}>
                  {enableSrinagarPickup ? "Pickup Active" : "Delivery Only"}
                </Badge>
              </div>
              <Text className="text-xs text-ui-fg-subtle leading-relaxed mb-4">
                Applicable strictly to Kashmir PIN codes (<code>19xxxx</code>). Jammu PIN codes (<code>18xxxx</code>) are excluded from pickup and receive doorstep delivery. When enabled, Kashmir customers see the Studio Self-Pickup option (FREE). When disabled, only Doorstep Delivery is shown.
              </Text>
            </div>
            <div className="pt-3 border-t border-ui-border-base flex items-center justify-between">
              <span className="text-sm font-medium text-ui-fg-base">
                Enable Srinagar Pickup
              </span>
              <Switch
                checked={enableSrinagarPickup}
                onCheckedChange={setEnableSrinagarPickup}
              />
            </div>
          </div>

          {/* Bengaluru Card */}
          <div className="p-4 rounded-xl border border-ui-border-base bg-ui-bg-subtle flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-ui-fg-base flex items-center gap-1.5">
                  🌿 Bengaluru Studio (Karnataka)
                </span>
                <Badge color={enableBengaluruPickup ? "green" : "grey"}>
                  {enableBengaluruPickup ? "Pickup Active" : "Delivery Only"}
                </Badge>
              </div>
              <Text className="text-xs text-ui-fg-subtle leading-relaxed mb-4">
                Applicable to Bengaluru PIN codes (<code>56xxxx</code>). When enabled, customers see the Studio Self-Pickup option (FREE). When disabled, only Doorstep Delivery is shown.
              </Text>
            </div>
            <div className="pt-3 border-t border-ui-border-base flex items-center justify-between">
              <span className="text-sm font-medium text-ui-fg-base">
                Enable Bengaluru Pickup
              </span>
              <Switch
                checked={enableBengaluruPickup}
                onCheckedChange={setEnableBengaluruPickup}
              />
            </div>
          </div>
        </div>
      </Container>

      <Container className="p-6">
        <Heading level="h2" className="mb-4">
          {editingId ? `Edit Rule (${pattern})` : "Add or Update Pincode Rule"}
        </Heading>
        <form onSubmit={handleSaveRule} className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div>
            <Label>Wildcard Pattern *</Label>
            <Input
              placeholder="e.g. 190* or 560* or *"
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              required
            />
          </div>
          <div>
            <Label>Delivery Charge (₹) *</Label>
            <Input
              type="number"
              min="0"
              placeholder="60"
              value={charge}
              onChange={(e) => setCharge(e.target.value)}
              required
            />
          </div>
          <div>
            <Label>Region / Label</Label>
            <Input
              placeholder="Kashmir Metro Zone (190*)"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
            />
          </div>
          <div>
            <Label>Estimated Transit</Label>
            <Input
              placeholder="1–2 business days"
              value={estimatedDays}
              onChange={(e) => setEstimatedDays(e.target.value)}
            />
          </div>
          <div>
            <Label>Zone Name</Label>
            <Input
              placeholder="Zone 1 — Kashmir Local Dispatch"
              value={zone}
              onChange={(e) => setZone(e.target.value)}
            />
          </div>
          <div>
            <Label>Free Shipping Above (₹, optional)</Label>
            <Input
              type="number"
              min="0"
              placeholder="Leave blank for flat rate"
              value={freeShippingAbove}
              onChange={(e) => setFreeShippingAbove(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-6 pt-5">
            <label className="flex items-center gap-2 text-sm">
              <Switch checked={codAvailable} onCheckedChange={setCodAvailable} />
              <span>COD Enabled</span>
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Switch checked={active} onCheckedChange={setActive} />
              <span>Active</span>
            </label>
          </div>
          <div className="flex items-end gap-2">
            <Button type="submit" isLoading={saving}>
              {editingId ? "Update Rule" : "Save Rule"}
            </Button>
            {editingId && (
              <Button type="button" variant="secondary" onClick={resetForm}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </Container>

      <Container className="p-0 overflow-hidden">
        <div className="p-6 pb-3">
          <Heading level="h2">Configured Pincode Rules ({rules.length})</Heading>
        </div>
        {loading ? (
          <div className="p-6 text-ui-fg-subtle">Loading rules...</div>
        ) : (
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Pattern</Table.HeaderCell>
                <Table.HeaderCell>Region / Label</Table.HeaderCell>
                <Table.HeaderCell>Delivery Fee</Table.HeaderCell>
                <Table.HeaderCell>Transit</Table.HeaderCell>
                <Table.HeaderCell>COD</Table.HeaderCell>
                <Table.HeaderCell>Status</Table.HeaderCell>
                <Table.HeaderCell className="text-right">Actions</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {rules.map((rule) => (
                <Table.Row key={rule.id}>
                  <Table.Cell>
                    <Badge color="purple">{rule.pattern}</Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="font-medium">{rule.label}</div>
                    <div className="text-xs text-ui-fg-subtle">{rule.zone}</div>
                  </Table.Cell>
                  <Table.Cell className="font-semibold">₹{rule.charge}</Table.Cell>
                  <Table.Cell>{rule.estimatedDays}</Table.Cell>
                  <Table.Cell>
                    <Badge color={rule.codAvailable ? "green" : "grey"}>
                      {rule.codAvailable ? "COD" : "Prepaid"}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge color={rule.active ? "green" : "red"}>
                      {rule.active ? "Active" : "Disabled"}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="small" variant="secondary" onClick={() => handleEdit(rule)}>
                        Edit
                      </Button>
                      <Button size="small" variant="danger" onClick={() => handleDelete(rule.id)}>
                        Delete
                      </Button>
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        )}
      </Container>
    </div>
  );
};

export const config = defineRouteConfig({
  label: "Pincode Shipping",
  icon: MapPin,
});

export default PincodeShippingPage;

