import Stripe from "stripe";

export const prerender = false;

const stripe = new Stripe(import.meta.env.STRIPE_SECRET_KEY as string);

const FLAT_BASE_FEE = 550; // in cents ($5.50)
const FLAT_ADDITIONAL_FEE = 220; // in cents ($2.20)

export async function POST({ request }: { request: Request }) {
  const { items } = await request.json();

// Flat shipping: $5.50 for first item, $2.20 for each additional
let totalQty = 0;
for (const item of items) {
  const qty = item.quantity || item.qty || 1;
  totalQty += qty;
}

let shippingAmount = 0;
if (totalQty > 0) {
  shippingAmount = FLAT_BASE_FEE + (totalQty - 1) * FLAT_ADDITIONAL_FEE;
}

const session = await stripe.checkout.sessions.create({
  payment_method_types: ["card"],
  line_items: items,
  mode: "payment",
  automatic_tax: { enabled: true },
  shipping_address_collection: {
    allowed_countries: ["US", "CA"],
  },

  shipping_options: [
    {
      shipping_rate_data: {
        type: "fixed_amount",
        fixed_amount: { amount: shippingAmount, currency: "usd" }, // ✅ use computed amount
        display_name:
          totalQty <= 1
            ? "Standard shipping"
            : `Standard shipping (${totalQty} items)`,
        delivery_estimate: {
          minimum: { unit: "business_day", value: 7 },
          maximum: { unit: "business_day", value: 10 },
        },
      },
    },
  ],

  success_url: "https://greatgusproductions.com/thank-you",
  cancel_url: "https://greatgusproductions.com/cart",
});

  return new Response(JSON.stringify({ url: session.url }), {
    headers: { "Content-Type": "application/json" },
  });
}
