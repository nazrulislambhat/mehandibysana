import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params;
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

  try {
    const { data: products } = await query.graph({
      entity: "product",
      fields: [
        "id",
        "title",
        "metadata",
        "variants.id",
        "variants.title",
        "variants.sku",
        "variants.metadata",
      ],
      filters: { id },
    });

    if (!products || products.length === 0) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const p = products[0];
    const isProductOutOfStock = Boolean(
      p.metadata?.out_of_stock === true || p.metadata?.out_of_stock === "true"
    );

    const variants = (p.variants || []).map((v: any) => ({
      id: v.id,
      title: v.title,
      sku: v.sku,
      isOutOfStock: Boolean(
        v.metadata?.out_of_stock === true || v.metadata?.out_of_stock === "true"
      ),
    }));

    return res.status(200).json({
      success: true,
      productId: p.id,
      title: p.title,
      isProductOutOfStock,
      variants,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to fetch stock status",
    });
  }
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params;
  const body = (req.body || {}) as {
    action: "toggle_product" | "toggle_variant";
    variantId?: string;
    outOfStock?: boolean;
  };

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
  const productService = req.scope.resolve(Modules.PRODUCT);

  try {
    const { data: products } = await query.graph({
      entity: "product",
      fields: [
        "id",
        "title",
        "metadata",
        "variants.id",
        "variants.title",
        "variants.metadata",
      ],
      filters: { id },
    });

    if (!products || products.length === 0) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const p = products[0];

    if (body.action === "toggle_product") {
      const nextOutOfStock =
        typeof body.outOfStock === "boolean"
          ? body.outOfStock
          : !Boolean(
              p.metadata?.out_of_stock === true ||
                p.metadata?.out_of_stock === "true"
            );

      const updatedMeta = {
        ...(p.metadata || {}),
        out_of_stock: nextOutOfStock,
      };

      await productService.updateProducts(p.id, {
        metadata: updatedMeta,
      });

      return res.status(200).json({
        success: true,
        productId: p.id,
        isProductOutOfStock: nextOutOfStock,
        message: `Product "${p.title}" is now marked as ${
          nextOutOfStock ? "Out of Stock" : "In Stock"
        }.`,
      });
    }

    if (body.action === "toggle_variant" && body.variantId) {
      const variant = (p.variants || []).find((v: any) => v.id === body.variantId);
      if (!variant) {
        return res
          .status(404)
          .json({ success: false, message: "Variant not found" });
      }

      const nextOutOfStock =
        typeof body.outOfStock === "boolean"
          ? body.outOfStock
          : !Boolean(
              variant.metadata?.out_of_stock === true ||
                variant.metadata?.out_of_stock === "true"
            );

      const updatedMeta = {
        ...(variant.metadata || {}),
        out_of_stock: nextOutOfStock,
      };

      await productService.updateProductVariants(variant.id, {
        metadata: updatedMeta,
      });

      return res.status(200).json({
        success: true,
        variantId: variant.id,
        isVariantOutOfStock: nextOutOfStock,
        message: `Variant "${variant.title}" is now marked as ${
          nextOutOfStock ? "Out of Stock" : "In Stock"
        }.`,
      });
    }

    return res.status(400).json({ success: false, message: "Invalid action" });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to update stock status",
    });
  }
}
