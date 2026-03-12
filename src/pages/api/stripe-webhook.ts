import { createHash } from "node:crypto";
import Stripe from "stripe";
import { getVariantKeyByPriceId } from "../../lib/shop-catalog";

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

type ShippingAddressLike = {
  line1?: string | null;
  line2?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
  country?: string | null;
  administrative_area?: string | null;
};

type ShippingDetailsLike = {
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: ShippingAddressLike | null;
};

function getFulfillmentRecipient(session: Stripe.Checkout.Session) {
  const shippingDetails = (session as Stripe.Checkout.Session & {
    shipping_details?: ShippingDetailsLike | null;
    collected_information?: { shipping_details?: ShippingDetailsLike | null } | null;
  }).shipping_details;

  const collectedShippingDetails = (session as Stripe.Checkout.Session & {
    collected_information?: { shipping_details?: ShippingDetailsLike | null } | null;
  }).collected_information?.shipping_details;

  const customerDetails = session.customer_details
    ? {
        name: session.customer_details.name,
        email: session.customer_details.email,
        phone: session.customer_details.phone,
        address: session.customer_details.address,
      }
    : null;

  const recipient = shippingDetails ?? collectedShippingDetails ?? customerDetails;
  const address = (recipient?.address ?? null) as ShippingAddressLike | null;

  return {
    name: recipient?.name ?? null,
    email: recipient?.email ?? null,
    phone: recipient?.phone ?? null,
    address1: address?.line1 ?? null,
    address2: address?.line2 ?? null,
    city: address?.city ?? null,
    stateCode: address?.administrative_area ?? address?.state ?? null,
    postalCode: address?.postal_code ?? null,
    countryCode: address?.country ?? null,
    source: shippingDetails
      ? "shipping_details"
      : collectedShippingDetails
        ? "collected_information.shipping_details"
        : customerDetails
          ? "customer_details"
          : "none",
  };
}

function getPrintfulOrderId(result: unknown) {
  if (result && typeof result === "object") {
    const maybeId = (result as { result?: { id?: unknown } }).result?.id;
    return typeof maybeId === "number" || typeof maybeId === "string" ? maybeId : null;
  }

  return null;
}

function getPrintfulExternalId(sessionId: string) {
  return `ggp${createHash("sha256").update(sessionId).digest("hex").slice(0, 29)}`;
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
      const eventSession = event.data.object as Stripe.Checkout.Session;
      const session = await stripe.checkout.sessions.retrieve(eventSession.id);
      const sessionContext = getSessionContext(session);

      if (session.payment_status !== "paid") {
        console.log("Session not paid, skipping", {
          ...sessionContext,
          paymentStatus: session.payment_status,
        });
        return new Response("Not paid", { status: 200 });
      }

      const confirm = import.meta.env.PRINTFUL_CONFIRM === "true";
      const printfulExternalId = getPrintfulExternalId(session.id);

      if (processedSessions.has(session.id)) {
        console.log("Duplicate session ignored", sessionContext);
        return new Response("Already processed", { status: 200 });
      }

      const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
        expand: ["data.price.product"]
      });

      const recipient = getFulfillmentRecipient(session);

      if (
        !recipient.name ||
        !recipient.address1 ||
        !recipient.city ||
        !recipient.postalCode ||
        !recipient.countryCode
      ) {
        console.error("Missing shipping fields", {
          ...sessionContext,
          shippingSource: recipient.source,
          hasName: Boolean(recipient.name),
          hasAddress1: Boolean(recipient.address1),
          hasCity: Boolean(recipient.city),
          hasPostalCode: Boolean(recipient.postalCode),
          hasCountry: Boolean(recipient.countryCode),
          customerDetailsPresent: Boolean(session.customer_details),
          shippingDetailsPresent: Boolean((session as Stripe.Checkout.Session & { shipping_details?: unknown }).shipping_details),
          collectedShippingPresent: Boolean((session as Stripe.Checkout.Session & { collected_information?: { shipping_details?: unknown } | null }).collected_information?.shipping_details),
        });
        return new Response("Missing shipping", { status: 200 });
      }

      const printfulItems = lineItems.data
        .map((item) => {
          const product = item.price?.product as Stripe.Product | null;
          const priceId = item.price?.id ?? "";

          const variantKey =
            (item.price?.metadata?.printful_variant_key as string) ||
            (product?.metadata?.printful_variant_key as string) ||
            getVariantKeyByPriceId(priceId) ||
            "";

          const variantId = STRIPE_TO_PRINTFUL[variantKey];

          if (!variantKey || !variantId) {
            console.error("Missing Printful mapping", {
              ...sessionContext,
              priceId: priceId || "unknown",
              description: item.description || "unknown",
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
        recipientCountry: recipient.countryCode,
        recipientState: recipient.stateCode,
      });

      const response = await fetch("https://api.printful.com/orders", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${import.meta.env.PRINTFUL_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          external_id: printfulExternalId,
          confirm,
          recipient: {
            name: recipient.name,
            address1: recipient.address1,
            address2: recipient.address2,
            city: recipient.city,
            state_code: recipient.stateCode,
            country_code: recipient.countryCode,
            zip: recipient.postalCode,
            email: recipient.email,
            phone: recipient.phone,
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
        const safePrintfulMessage =
          typeof result === "object" &&
          result &&
          typeof (result as { error?: { message?: unknown } }).error?.message === "string"
            ? (result as { error?: { message?: string } }).error?.message
            : "Printful request failed";
        const duplicateExternalId =
          response.status === 400 &&
          printfulErrorMessage.includes("external_id") &&
          printfulErrorMessage.includes("already exists");

        if (duplicateExternalId) {
          processedSessions.add(session.id);
          console.log("Printful duplicate external_id ignored", {
            ...sessionContext,
            externalId: printfulExternalId,
            printfulOrderId: getPrintfulOrderId(result),
          });
          return new Response("Already processed", { status: 200 });
        }

        console.error("Printful order failed", {
          ...sessionContext,
          status: response.status,
          printfulOrderId: getPrintfulOrderId(result),
          errorMessage: safePrintfulMessage,
        });

        // Return 200 so Stripe doesn't keep retrying the webhook
        return new Response(`Printful failed: ${safePrintfulMessage}`, { status: 200 });
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