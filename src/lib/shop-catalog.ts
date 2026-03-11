export const MAX_CHECKOUT_ITEM_QTY = 10;

export type ShopVariant = {
  variantKey?: string;
  stripePriceId: string;
  productName: string;
  variantLabel: string;
  unitPrice: number;
};

export type CheckoutRequestItem = {
  variantKey?: unknown;
  quantity?: unknown;
  qty?: unknown;
};

export type CheckoutLineItem = {
  price: string;
  quantity: number;
};

export const SHOP_VARIANTS: Record<string, ShopVariant> = {
  beanie_black: {
    stripePriceId: "price_1T61YDQr2Bps1O2DHGcU8tTa",
    productName: "Great Gus Beanie",
    variantLabel: "Black",
    unitPrice: 29,
  },
  beanie_grey: {
    stripePriceId: "price_1T61YGQr2Bps1O2DB7Ld75TI",
    productName: "Great Gus Beanie",
    variantLabel: "Grey",
    unitPrice: 29,
  },
  beanie_yellow: {
    stripePriceId: "price_1T61YSQr2Bps1O2DW12FhmFN",
    productName: "Great Gus Beanie",
    variantLabel: "Yellow",
    unitPrice: 29,
  },
  hat_black: {
    stripePriceId: "price_1T61YOQr2Bps1O2D8TI5kkal",
    productName: "Great Gus Hat",
    variantLabel: "Black",
    unitPrice: 29,
  },
  hat_grey: {
    stripePriceId: "price_1T61YMQr2Bps1O2DlrKElRLg",
    productName: "Great Gus Hat",
    variantLabel: "Grey",
    unitPrice: 29,
  },
  hoodie_s: {
    stripePriceId: "price_1T61YUQr2Bps1O2DqCRNu9YY",
    productName: "Great Gus Hoodie",
    variantLabel: "S",
    unitPrice: 65,
  },
  hoodie_m: {
    stripePriceId: "price_1T61XgQr2Bps1O2D7uKNUEqE",
    productName: "Great Gus Hoodie",
    variantLabel: "M",
    unitPrice: 65,
  },
  hoodie_l: {
    stripePriceId: "price_1T61XcQr2Bps1O2DlkCfSXbe",
    productName: "Great Gus Hoodie",
    variantLabel: "L",
    unitPrice: 65,
  },
  hoodie_xl: {
    stripePriceId: "price_1T61XXQr2Bps1O2DVZRso7U6",
    productName: "Great Gus Hoodie",
    variantLabel: "XL",
    unitPrice: 65,
  },
  hoodie_2xl: {
    stripePriceId: "price_1T61XRQr2Bps1O2DUZzbUjXL",
    productName: "Great Gus Hoodie",
    variantLabel: "2XL",
    unitPrice: 65,
  },
  tee_s: {
    stripePriceId: "price_1T61Y9Qr2Bps1O2D2P1FHofy",
    productName: "Great Gus Tee",
    variantLabel: "S",
    unitPrice: 35,
  },
  tee_m: {
    stripePriceId: "price_1T61Y6Qr2Bps1O2DgebVOUPN",
    productName: "Great Gus Tee",
    variantLabel: "M",
    unitPrice: 35,
  },
  tee_l: {
    stripePriceId: "price_1T61Y4Qr2Bps1O2DUXAZ7FMS",
    productName: "Great Gus Tee",
    variantLabel: "L",
    unitPrice: 35,
  },
  tee_xl: {
    stripePriceId: "price_1T61Y0Qr2Bps1O2DcIGFlVy1",
    productName: "Great Gus Tee",
    variantLabel: "XL",
    unitPrice: 35,
  },
  tee_2xl: {
    stripePriceId: "price_1T61XxQr2Bps1O2D69cKCO44",
    productName: "Great Gus Tee",
    variantLabel: "2XL",
    unitPrice: 35,
  },
  tee_3xl: {
    stripePriceId: "price_1T61XnQr2Bps1O2DBXyEchXR",
    productName: "Great Gus Tee",
    variantLabel: "3XL",
    unitPrice: 35,
  },
  tee_4xl: {
    stripePriceId: "price_1T61XjQr2Bps1O2Duxgi3LoQ",
    productName: "Great Gus Tee",
    variantLabel: "4XL",
    unitPrice: 35,
  },
};

const SHOP_VARIANT_MAP = new Map<string, ShopVariant>(Object.entries(SHOP_VARIANTS));
const SHOP_VARIANT_KEY_BY_PRICE_ID = new Map<string, string>(
  Object.entries(SHOP_VARIANTS).map(([variantKey, variant]) => [variant.stripePriceId, variantKey])
);

export function getShopVariant(key: string): ShopVariant | null {
  const variant = SHOP_VARIANT_MAP.get(key);
  return variant ? { ...variant, variantKey: key } : null;
}

export function getVariantKeyByPriceId(priceId: string): string | null {
  return SHOP_VARIANT_KEY_BY_PRICE_ID.get(priceId) ?? null;
}

export function buildValidatedCheckoutLineItems(items: CheckoutRequestItem[]): {
  lineItems: CheckoutLineItem[];
  totalQty: number;
} | {
  error: string;
} {
  const lineItems: CheckoutLineItem[] = [];
  let totalQty = 0;

  for (const item of items) {
    if (typeof item?.variantKey !== "string") {
      return { error: "Unknown product variant." };
    }

    const catalogEntry = getShopVariant(item.variantKey);
    if (!catalogEntry) {
      return { error: "Unknown product variant." };
    }

    const rawQty = item?.quantity ?? item?.qty;
    const qty = typeof rawQty === "number" ? rawQty : Number(rawQty);

    if (!Number.isInteger(qty) || qty < 1 || qty > MAX_CHECKOUT_ITEM_QTY) {
      return { error: `Quantity must be an integer between 1 and ${MAX_CHECKOUT_ITEM_QTY}.` };
    }

    totalQty += qty;
    lineItems.push({
      price: catalogEntry.stripePriceId,
      quantity: qty,
    });
  }

  return { lineItems, totalQty };
}