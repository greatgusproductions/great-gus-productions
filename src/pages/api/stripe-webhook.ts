import Stripe from "stripe";

const processedSessions = new Set<string>();

export const prerender = false;

const stripe = new Stripe(import.meta.env.STRIPE_SECRET_KEY as string);

const STRIPE_TO_PRINTFUL: Record<string, number> = {
  // Beanie (numeric sync_variant_id values)
  beanie_black: 5209283098,
  beanie_yellow: 5209283099,
  beanie_grey: 5209283100,

  // Tee (numeric sync_variant_id)
  tee_s: 5209282628,
  tee_m: 5209282629,
  tee_l: 5209282630,
  tee_xl: 5209282631,
  tee_2xl: 5209282632,
  tee_3xl: 5209282633,
  tee_4xl: 5209282634,
  tee_5xl: 5209282635,

  // Hoodie (numeric sync_variant_id)
  hoodie_s: 5209281889,
  hoodie_m: 5209281890,
  hoodie_l: 5209281891,
  hoodie_xl: 5209281892,
  hoodie_2xl: 5209281893,

  // Hat (numeric sync_variant_id)
  hat_black: 5209281214,
  hat_grey: 5209281215,
};

export async function POST({ request }: { request: Request }) {

  const sig = request.headers.get("stripe-signature");
  const rawBody = await request.text();

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig as string,
      import.meta.env.STRIPE_WEBHOOK_SECRET as string
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return new Response("Webhook Error", { status: 400 });
  }

if (event.type === "checkout.session.completed") {
  const session = event.data.object as Stripe.Checkout.Session;

  if (session.payment_status !== "paid") {
  console.log("Session not paid, skipping:", session.id, session.payment_status);
  return new Response("Not paid", { status: 200 });
}

const confirm = import.meta.env.PRINTFUL_CONFIRM === "true";

  if (processedSessions.has(session.id)) {
    console.log("Duplicate session ignored:", session.id);
    return new Response("Already processed");
  }

  processedSessions.add(session.id);

    const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
      expand: ["data.price.product"]
    });


    console.log("Line items debug:", lineItems.data.map(li => ({
      desc: li.description,
      qty: li.quantity,
      priceId: li.price?.id,
      priceMeta: li.price?.metadata,
      productMeta: (li.price?.product as any)?.metadata,
    })));

    const shipping = (session as any).shipping_details ?? session.customer_details;

    if (
      !shipping?.name ||
      !shipping?.address?.line1 ||
      !shipping?.address?.city ||
      !shipping?.address?.postal_code ||
      !shipping?.address?.country
    ) {
      console.error("Missing shipping fields", { sessionId: session.id, shipping });
      return new Response("Missing shipping", { status: 200 });
    }

  const printfulItems = lineItems.data
    .map((item) => {
      const product = item.price?.product as Stripe.Product | null;

      const variantKey =
        (item.price?.metadata?.printful_variant_key as string) ||
        (product?.metadata?.printful_variant_key as string) ||
        "";

      const variantId = STRIPE_TO_PRINTFUL[variantKey];

      if (!variantKey || !variantId) {
        console.error("Missing Printful mapping", { sessionId: session.id, variantKey });
        return null;
      }

      return {
        sync_variant_id: variantId,      // numeric sync_variant_id
        quantity: item.quantity ?? 1
      };
    })
    .filter(Boolean) as { sync_variant_id: number; quantity: number }[];

  if (printfulItems.length === 0) {
    console.error("No valid Printful items, skipping order", { sessionId: session.id });
    return new Response("No valid items", { status: 200 });
  }

  console.log("printfulItems being sent to Printful:", printfulItems);
    
    const response = await fetch("https://api.printful.com/orders", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${import.meta.env.PRINTFUL_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        external_id: `stripe_${session.id}`.slice(0, 32),
        confirm,                 // draft in dev, auto-confirm in prod
        recipient: {
          name: shipping?.name,
          address1: shipping?.address?.line1,
          address2: shipping?.address?.line2,
          city: shipping?.address?.city,
          state_code: shipping?.address?.administrative_area || shipping?.address?.state,
          country_code: shipping?.address?.country,
          zip: shipping?.address?.postal_code,
          email: shipping?.email,
          phone: shipping?.phone,
        },
        items: printfulItems
      })
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("Printful order failed", {
        status: response.status,
        result,
        sessionId: session.id
      });

    // Return 200 so Stripe doesn't keep retrying the webhook
    return new Response("Printful failed", { status: 200 });
    }

    console.log("Printful order created:", result);
  }

  return new Response("ok");
}