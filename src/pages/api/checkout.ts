import Stripe from "stripe";
import { buildValidatedCheckoutLineItems, type CheckoutRequestItem } from "../../lib/shop-catalog";

export const prerender = false;

const stripe = new Stripe(import.meta.env.STRIPE_SECRET_KEY as string);

const FLAT_BASE_FEE = 550; // in cents ($5.50)
const FLAT_ADDITIONAL_FEE = 220; // in cents ($2.20)

const WORLDWIDE_SHIPPING_COUNTRIES: Stripe.Checkout.SessionCreateParams.ShippingAddressCollection.AllowedCountry[] = [
  "AC", "AD", "AE", "AF", "AG", "AI", "AL", "AM", "AO", "AQ", "AR", "AT", "AU", "AW", "AX", "AZ",
  "BA", "BB", "BD", "BE", "BF", "BG", "BH", "BI", "BJ", "BL", "BM", "BN", "BO", "BQ", "BR", "BS",
  "BT", "BV", "BW", "BY", "BZ", "CA", "CD", "CF", "CG", "CH", "CI", "CK", "CL", "CM", "CN", "CO",
  "CR", "CV", "CW", "CY", "CZ", "DE", "DJ", "DK", "DM", "DO", "DZ", "EC", "EE", "EG", "EH", "ER",
  "ES", "ET", "FI", "FJ", "FK", "FO", "FR", "GA", "GB", "GD", "GE", "GF", "GG", "GH", "GI", "GL",
  "GM", "GN", "GP", "GQ", "GR", "GS", "GT", "GU", "GW", "GY", "HK", "HN", "HR", "HT", "HU", "ID",
  "IE", "IL", "IM", "IN", "IO", "IQ", "IS", "IT", "JE", "JM", "JO", "JP", "KE", "KG", "KH", "KI",
  "KM", "KN", "KR", "KW", "KY", "KZ", "LA", "LB", "LC", "LI", "LK", "LR", "LS", "LT", "LU", "LV",
  "LY", "MA", "MC", "MD", "ME", "MF", "MG", "MK", "ML", "MM", "MN", "MO", "MQ", "MR", "MS", "MT",
  "MU", "MV", "MW", "MX", "MY", "MZ", "NA", "NC", "NE", "NG", "NI", "NL", "NO", "NP", "NR", "NU",
  "NZ", "OM", "PA", "PE", "PF", "PG", "PH", "PK", "PL", "PM", "PN", "PR", "PS", "PT", "PY", "QA",
  "RE", "RO", "RS", "RU", "RW", "SA", "SB", "SC", "SD", "SE", "SG", "SH", "SI", "SJ", "SK", "SL",
  "SM", "SN", "SO", "SR", "SS", "ST", "SV", "SX", "SZ", "TA", "TC", "TD", "TF", "TG", "TH", "TJ",
  "TK", "TL", "TM", "TN", "TO", "TR", "TT", "TV", "TW", "TZ", "UA", "UG", "US", "UY", "UZ", "VA",
  "VC", "VE", "VG", "VN", "VU", "WF", "WS", "XK", "YE", "YT", "ZA", "ZM", "ZW"
];

export async function POST({ request }: { request: Request }) {
  try {
    const { items } = await request.json() as { items?: CheckoutRequestItem[] };

    // Basic validation
    if (!Array.isArray(items) || items.length === 0) {
      return new Response(
        JSON.stringify({ error: "Invalid request." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const checkoutData = buildValidatedCheckoutLineItems(items);
    if ("error" in checkoutData) {
      return new Response(
        JSON.stringify({ error: checkoutData.error }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = checkoutData.lineItems;
    const { totalQty } = checkoutData;

    let shippingAmount = 0;
    if (totalQty > 0) {
      shippingAmount = FLAT_BASE_FEE + (totalQty - 1) * FLAT_ADDITIONAL_FEE;
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      automatic_tax: { enabled: true },
      shipping_address_collection: {
        allowed_countries: WORLDWIDE_SHIPPING_COUNTRIES,
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
              maximum: { unit: "business_day", value: 21 },
            },
          },
        },
      ],

      success_url: "https://greatgusproductions.com/thank-you/?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: "https://greatgusproductions.com/cart/",
    });

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[Stripe Checkout Error]", err);
    return new Response(
      JSON.stringify({ error: "Unable to start checkout. Please try again." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
