import { defineWidgetConfig } from "@medusajs/admin-sdk";
import type { AdminProduct, DetailWidgetProps } from "@medusajs/framework/types";
import { Badge, Button, Container, Heading, Text, toast } from "@medusajs/ui";
import { useEffect, useState } from "react";

interface VariantStockItem {
  id: string;
  title: string;
  sku?: string;
  isOutOfStock: boolean;
}

const ProductStockControlWidget = ({
  data,
}: DetailWidgetProps<AdminProduct>) => {
  const [productOutOfStock, setProductOutOfStock] = useState<boolean>(() => {
    return Boolean(
      data?.metadata?.out_of_stock === true ||
        data?.metadata?.out_of_stock === "true"
    );
  });

  const [variants, setVariants] = useState<VariantStockItem[]>(() => {
    return (data?.variants || []).map((v: any) => ({
      id: v.id,
      title: v.title,
      sku: v.sku,
      isOutOfStock: Boolean(
        v.metadata?.out_of_stock === true ||
          v.metadata?.out_of_stock === "true"
      ),
    }));
  });

  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  // Sync state if initial data changes or on load
  useEffect(() => {
    if (data?.id) {
      fetch(`/admin/products/${data.id}/stock-status`, {
        credentials: "include",
      })
        .then((r) => r.json())
        .then((res) => {
          if (res.success) {
            setProductOutOfStock(Boolean(res.isProductOutOfStock));
            if (Array.isArray(res.variants)) {
              setVariants(res.variants);
            }
          }
        })
        .catch(() => {
          // Non-fatal; initial state from props is already loaded
        });
    }
  }, [data?.id]);

  const handleToggleProduct = async () => {
    setLoadingAction("product");
    const nextState = !productOutOfStock;
    try {
      const res = await fetch(`/admin/products/${data.id}/stock-status`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "toggle_product",
          outOfStock: nextState,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        toast.error(json.message || "Failed to update product stock status.");
        setLoadingAction(null);
        return;
      }
      setProductOutOfStock(nextState);
      toast.success(
        nextState
          ? `Entire product "${data.title}" marked as Out of Stock.`
          : `Entire product "${data.title}" is now In Stock.`
      );
    } catch (err: any) {
      toast.error(err.message || "Failed to update stock status.");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleToggleVariant = async (variantId: string) => {
    setLoadingAction(variantId);
    const target = variants.find((v) => v.id === variantId);
    if (!target) return;
    const nextState = !target.isOutOfStock;

    try {
      const res = await fetch(`/admin/products/${data.id}/stock-status`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "toggle_variant",
          variantId,
          outOfStock: nextState,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        toast.error(json.message || "Failed to update variant stock status.");
        setLoadingAction(null);
        return;
      }
      setVariants((prev) =>
        prev.map((v) =>
          v.id === variantId ? { ...v, isOutOfStock: nextState } : v
        )
      );
      toast.success(
        nextState
          ? `Variant "${target.title}" marked as Out of Stock.`
          : `Variant "${target.title}" is now In Stock.`
      );
    } catch (err: any) {
      toast.error(err.message || "Failed to update variant stock status.");
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <Container className="p-6 divide-y divide-ui-border-base space-y-5">
      {/* Product-level Quick Stock Control */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Heading level="h2" className="text-base font-semibold text-ui-fg-base">
                🌿 Storefront Stock Availability
              </Heading>
              {productOutOfStock ? (
                <Badge color="red" size="small">
                  Entire Product Out of Stock
                </Badge>
              ) : (
                <Badge color="green" size="small">
                  In Stock & Available
                </Badge>
              )}
            </div>
            <Text className="text-xs text-ui-fg-subtle">
              Toggle whole-product or per-variant stock without touching Medusa inventory limits.
            </Text>
          </div>

          <Button
            size="small"
            variant={productOutOfStock ? "secondary" : "danger"}
            isLoading={loadingAction === "product"}
            disabled={loadingAction !== null}
            onClick={handleToggleProduct}
            className="flex-shrink-0"
          >
            {productOutOfStock
              ? "✓ Make Entire Product In Stock"
              : "✕ Mark Entire Product Out of Stock"}
          </Button>
        </div>

        {productOutOfStock && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md text-xs text-red-900 leading-relaxed">
            <strong>Note:</strong> The entire product is currently marked <strong>Out of Stock</strong>. On the storefront, the "Add to Bag" button is disabled and displays a "Batch Restocking / Out of stock" notice regardless of individual variant settings.
          </div>
        )}
      </div>

      {/* Per-Variant Granular Stock Control */}
      {variants.length > 0 && (
        <div className="pt-5 space-y-3">
          <div className="flex items-center justify-between">
            <Text className="text-xs font-semibold uppercase tracking-wider text-ui-fg-muted">
              Individual Variant Availability ({variants.length})
            </Text>
            <Text className="text-[11px] text-ui-fg-subtle">
              Changes apply instantly to the storefront
            </Text>
          </div>

          <div className="border border-ui-border-base rounded-lg divide-y divide-ui-border-base overflow-hidden">
            {variants.map((v) => {
              const isEffectiveOutOfStock = productOutOfStock || v.isOutOfStock;
              return (
                <div
                  key={v.id}
                  className="p-3.5 flex items-center justify-between gap-4 bg-ui-bg-subtle/40 hover:bg-ui-bg-subtle transition-colors"
                >
                  <div className="min-w-0 flex items-center gap-2.5">
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        isEffectiveOutOfStock ? "bg-red-500" : "bg-emerald-500"
                      }`}
                    />
                    <div className="min-w-0">
                      <Text className="text-xs font-medium text-ui-fg-base truncate">
                        {v.title}
                      </Text>
                      {v.sku && (
                        <Text className="text-[10px] font-mono text-ui-fg-muted">
                          SKU: {v.sku}
                        </Text>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {productOutOfStock ? (
                      <Badge color="grey" size="xsmall">
                        Blocked by Product
                      </Badge>
                    ) : v.isOutOfStock ? (
                      <Badge color="red" size="xsmall">
                        Out of Stock
                      </Badge>
                    ) : (
                      <Badge color="green" size="xsmall">
                        In Stock
                      </Badge>
                    )}

                    <Button
                      size="small"
                      variant={v.isOutOfStock ? "secondary" : "danger"}
                      disabled={loadingAction !== null || productOutOfStock}
                      isLoading={loadingAction === v.id}
                      onClick={() => handleToggleVariant(v.id)}
                      className="text-xs h-7 px-2.5"
                    >
                      {v.isOutOfStock ? "Mark In Stock" : "Mark Out of Stock"}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Container>
  );
};

export const config = defineWidgetConfig({
  zone: "product.details.before",
});

export default ProductStockControlWidget;
