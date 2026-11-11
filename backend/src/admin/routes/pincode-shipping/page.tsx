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

  // Live Pincode Simulator
  const [testPin, setTestPin] = useState("190001");
  const [testResult, setTestResult] = useState<any>(null);

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
              Configure prefix wildcards (e.g. <code>190*</code> for Srinagar PINs at ₹60,{" "}
              <code>560*</code> for Bengaluru PINs at ₹60, or <code>*</code> for Pan-India at ₹150). Most specific prefix wins.
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
          </div>
        )}
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
              placeholder="Srinagar Metro Zone (190*)"
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
              placeholder="Zone 1 — Srinagar Local Dispatch"
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

