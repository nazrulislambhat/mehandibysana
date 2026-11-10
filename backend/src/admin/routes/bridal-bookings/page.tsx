import { defineRouteConfig } from "@medusajs/admin-sdk";
import { Calendar } from "@medusajs/icons";
import {
  Badge,
  Button,
  Container,
  Heading,
  Input,
  Table,
  Text,
} from "@medusajs/ui";
import { useEffect, useState } from "react";

type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";

interface BridalBooking {
  id: string;
  referenceId: string;
  name: string;
  email: string;
  phone: string;
  service: string;
  eventDate: string;
  location: string;
  message: string;
  status: BookingStatus;
  advancePaidInr: number;
  adminNotes: string;
  createdAt: string;
}

const BridalBookingsAdminPage = () => {
  const [bookings, setBookings] = useState<BridalBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [advanceDrafts, setAdvanceDrafts] = useState<Record<string, string>>({});

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/admin/bridal-bookings", {
        credentials: "include",
      });
      const data = await res.json();
      const list: BridalBooking[] = data.bookings || [];
      setBookings(list);
      const drafts: Record<string, string> = {};
      list.forEach((b) => {
        drafts[b.id] = String(b.advancePaidInr || 0);
      });
      setAdvanceDrafts(drafts);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const updateBooking = async (
    id: string,
    patch: { status?: BookingStatus; advancePaidInr?: number }
  ) => {
    setSavingId(id);
    try {
      const res = await fetch("/admin/bridal-bookings", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update", id, ...patch }),
      });
      const data = await res.json();
      if (data.bookings) {
        setBookings(data.bookings);
      }
    } finally {
      setSavingId(null);
    }
  };

  const filtered =
    filter === "all"
      ? bookings
      : bookings.filter((b) => b.status === filter);

  const badgeColor = (status: BookingStatus) => {
    if (status === "confirmed") return "green";
    if (status === "completed") return "blue";
    if (status === "cancelled") return "red";
    return "orange";
  };

  return (
    <Container className="divide-y p-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-6 py-5">
        <div>
          <Heading level="h1">Bridal &amp; Event Bookings</Heading>
          <Text size="small" className="text-ui-fg-subtle mt-1">
            Review date inquiries submitted from mehandibysana.com/contact, record advance deposits, and confirm appointment dates.
          </Text>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {["all", "pending", "confirmed", "completed", "cancelled"].map((st) => (
            <Button
              key={st}
              size="small"
              variant={filter === st ? "primary" : "secondary"}
              onClick={() => setFilter(st)}
            >
              {st.toUpperCase()}
            </Button>
          ))}
        </div>
      </div>

      <div className="p-6">
        {loading ? (
          <Text size="small" className="text-ui-fg-subtle">
            Loading booking inquiries…
          </Text>
        ) : filtered.length === 0 ? (
          <div className="rounded-lg border border-dashed p-8 text-center">
            <Text size="base" weight="plus">
              No inquiries in this view
            </Text>
            <Text size="small" className="text-ui-fg-subtle mt-1">
              New bridal and celebration requests submitted on the storefront will appear here automatically.
            </Text>
          </div>
        ) : (
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Ref &amp; Client</Table.HeaderCell>
                <Table.HeaderCell>Service &amp; Date</Table.HeaderCell>
                <Table.HeaderCell>Notes</Table.HeaderCell>
                <Table.HeaderCell>Advance (₹)</Table.HeaderCell>
                <Table.HeaderCell>Status</Table.HeaderCell>
                <Table.HeaderCell className="text-right">Actions</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {filtered.map((b) => (
                <Table.Row key={b.id}>
                  <Table.Cell>
                    <div className="font-mono text-xs font-semibold">{b.referenceId}</div>
                    <div className="font-medium text-sm">{b.name}</div>
                    <div className="text-xs text-ui-fg-subtle">
                      {b.email} {b.phone ? `· ${b.phone}` : ""}
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="text-xs font-semibold uppercase">{b.service}</div>
                    <div className="text-xs mt-0.5">
                      Date: <strong>{b.eventDate || "Flexible"}</strong>
                    </div>
                    <div className="text-xs text-ui-fg-subtle">{b.location || "Srinagar"}</div>
                  </Table.Cell>
                  <Table.Cell className="max-w-xs">
                    <Text size="small" className="line-clamp-2">
                      {b.message}
                    </Text>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex items-center gap-1.5 w-32">
                      <Input
                        size="small"
                        type="number"
                        min="0"
                        value={advanceDrafts[b.id] ?? "0"}
                        onChange={(e) =>
                          setAdvanceDrafts((prev) => ({
                            ...prev,
                            [b.id]: e.target.value,
                          }))
                        }
                      />
                      <Button
                        size="small"
                        variant="secondary"
                        disabled={savingId === b.id}
                        onClick={() =>
                          updateBooking(b.id, {
                            advancePaidInr: Number(advanceDrafts[b.id]) || 0,
                          })
                        }
                      >
                        Save
                      </Button>
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge color={badgeColor(b.status)}>{b.status.toUpperCase()}</Badge>
                  </Table.Cell>
                  <Table.Cell className="text-right">
                    <div className="inline-flex items-center gap-1.5">
                      {b.status !== "confirmed" ? (
                        <Button
                          size="small"
                          variant="primary"
                          disabled={savingId === b.id}
                          onClick={() => updateBooking(b.id, { status: "confirmed" })}
                        >
                          Confirm
                        </Button>
                      ) : null}
                      {b.status === "confirmed" ? (
                        <Button
                          size="small"
                          variant="secondary"
                          disabled={savingId === b.id}
                          onClick={() => updateBooking(b.id, { status: "completed" })}
                        >
                          Complete
                        </Button>
                      ) : null}
                      {b.phone ? (
                        <a
                          href={`https://wa.me/${b.phone.replace(/\D/g, "")}?text=${encodeURIComponent(
                            `Assalamu Alaikum ${b.name}, regarding your Mehandi by Sana booking inquiry (${b.referenceId}): `
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs underline px-2 py-1"
                        >
                          WhatsApp
                        </a>
                      ) : null}
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        )}
      </div>
    </Container>
  );
};

export const config = defineRouteConfig({
  label: "Bridal Bookings",
  icon: Calendar,
});

export default BridalBookingsAdminPage;

