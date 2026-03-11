import Stripe from "stripe";

const processedSessions = new Set<string>();

export const prerender = false;

const stripe = new Stripe(import.meta.env.STRIPE_SECRET_KEY as string);

function getSafeErrorDetails(error: unknown) {
  if (error && typeof error === "object") {
    const { type, code, message } = error as {
      type?: unknown;
      code?: unknown;
      message?: unknown;
    };

    return {
      errorType: typeof type === "string" ? type : undefined,
      errorCode: typeof code === "string" ? code : undefined,
      errorMessage: typeof message === "string" ? message : "Unexpected error",
    };
  }

  return {
    errorMessage: typeof error === "string" ? error : "Unexpected error",
  };
}

function getSessionContext(session: Stripe.Checkout.Session) {
  return {
    sessionId: session.id,
    paymentIntentId:
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id ?? null,
  };
}

function getPrintfulOrderId(result: unknown) {
  if (result && typeof result === "object") {
    const maybeId = (result as { result?: { id?: unknown } }).result?.id;
    return typeof maybeId === "number" || typeof maybeId === "string" ? maybeId : null;
  }

  return null;
}

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
    console.error("Webhook signature verification failed", getSafeErrorDetails(err));
    return new Response("Webhook Error", { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    try {
      const session = event.data.object as Stripe.Checkout.Session;
      const sessionContext = getSessionContext(session);

      if (session.payment_status !== "paid") {
        console.log("Session not paid, skipping", {
          ...sessionContext,
          paymentStatus: session.payment_status,
        });
        return new Response("Not paid", { status: 200 });
      }

      const confirm = import.meta.env.PRINTFUL_CONFIRM === "true";

      if (processedSessions.has(session.id)) {
        console.log("Duplicate session ignored", sessionContext);
        return new Response("Already processed", { status: 200 });
      }

      const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
        expand: ["data.price.product"]
      });

      const shipping = (session as any).shipping_details ?? session.customer_details;

      if (
        !shipping?.name ||
        !shipping?.address?.line1 ||
        !shipping?.address?.city ||
        !shipping?.address?.postal_code ||
        !shipping?.address?.country
      ) {
        console.error("Missing shipping fields", {
          ...sessionContext,
          hasName: Boolean(shipping?.name),
          hasAddress1: Boolean(shipping?.address?.line1),
          hasCity: Boolean(shipping?.address?.city),
          hasPostalCode: Boolean(shipping?.address?.postal_code),
          hasCountry: Boolean(shipping?.address?.country),
        });
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
            console.error("Missing Printful mapping", {
              ...sessionContext,
              variantKey: variantKey || "unknown",
            });
            return null;
          }

          return {
            sync_variant_id: variantId, // numeric sync_variant_id
            quantity: item.quantity ?? 1
          };
        })
        .filter(Boolean) as { sync_variant_id: number; quantity: number }[];

      if (printfulItems.length === 0) {
        console.error("No valid Printful items, skipping order", sessionContext);
        return new Response("No valid items", { status: 200 });
      }

      console.log("Sending items to Printful", {
        ...sessionContext,
        itemCount: printfulItems.length,
        variantIds: printfulItems.map((item) => item.sync_variant_id),
      });

      const response = await fetch("https://api.printful.com/orders", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${import.meta.env.PRINTFUL_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          external_id: `stripe_${session.id}`,
          confirm, // draft in dev, auto-confirm in prod
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

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        const printfulErrorMessage =
          typeof result?.error?.message === "string"
            ? result.error.message.toLowerCase()
            : "";
        const duplicateExternalId =
          response.status === 400 &&
          printfulErrorMessage.includes("external_id") &&
          printfulErrorMessage.includes("already exists");

        if (duplicateExternalId) {
          processedSessions.add(session.id);
          console.log("Printful duplicate external_id ignored", {
            ...sessionContext,
            externalId: `stripe_${session.id}`,
            printfulOrderId: getPrintfulOrderId(result),
          });
          return new Response("Already processed", { status: 200 });
        }

        console.error("Printful order failed", {
          ...sessionContext,
          status: response.status,
          printfulOrderId: getPrintfulOrderId(result),
          errorMessage:
            typeof result === "object" &&
            result &&
            typeof (result as { error?: { message?: unknown } }).error?.message === "string"
              ? (result as { error?: { message?: string } }).error?.message
              : "Printful request failed",
        });

        // Return 200 so Stripe doesn't keep retrying the webhook
        return new Response("Printful failed", { status: 200 });
      }

      console.log("Printful order created", {
        ...sessionContext,
        printfulOrderId: getPrintfulOrderId(result),
      });
      processedSessions.add(session.id);
    } catch (err) {
      console.error("Webhook fulfillment error", getSafeErrorDetails(err));
      return new Response("Fulfillment error", { status: 200 });
    }
  }

  return new Response("ok");
}