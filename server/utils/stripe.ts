import Stripe from "stripe";
import type { Request, Response } from "express";
import { supabaseAdminClient } from "../supabase.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const stripeUtilsDir = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({
  path: path.resolve(stripeUtilsDir, "../../.env"),
  quiet: true,
});

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
const STORE_ENTITLEMENT_PRICE_ID =
  process.env.STRIPE_STORE_ENTITLEMENT_PRICE_ID;

if (!STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY must be defined");
}

if (!STRIPE_WEBHOOK_SECRET) {
  throw new Error("STRIPE_WEBHOOK_SECRET must be defined");
}

if (!STORE_ENTITLEMENT_PRICE_ID) {
  throw new Error("STRIPE_STORE_ENTITLEMENT_PRICE_ID must be defined");
}

export const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: "2026-02-25.clover",
  typescript: true,
});

export const stripeWebhookHandler = async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"];

  if (!sig) {
    res.status(400).send("Missing Stripe signature");
    return;
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown";
    console.error("Webhook signature verification failed:", err);
    res.status(400).send(`Webhook Error: ${message}`);
    return;
  }

  try {
    if (event.type !== "checkout.session.completed") {
      console.log("Ignoring Stripe event:", event.type);
      res.sendStatus(200);
      return;
    }

    const session = event.data.object;

    if (session.mode !== "payment" || session.payment_status !== "paid") {
      console.log("Ignoring incomplete Checkout Session:", session.id);
      res.sendStatus(200);
      return;
    }

    const storeId = session.metadata?.storeId;
    const paymentIntentId =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id;
    const customerId =
      typeof session.customer === "string"
        ? session.customer
        : session.customer?.id;

    if (!storeId || !paymentIntentId) {
      console.error("Invalid Checkout Session event", {
        customer: customerId,
        paymentIntentId,
        sessionId: session.id,
        storeId,
      });
      res.status(400).send("Invalid Checkout Session event");
      return;
    }

    console.log("Processing Stripe webhook event:", event.id);
    const { error: entitlementError } = await supabaseAdminClient
      .from("store_entitlements")
      .upsert(
        {
          amount_total: session.amount_total,
          currency: session.currency,
          status: "active",
          store_id: storeId,
          stripe_checkout_session_id: session.id,
          stripe_customer_id: customerId ?? null,
          stripe_payment_intent_id: paymentIntentId,
          stripe_price_id: STORE_ENTITLEMENT_PRICE_ID,
        },
        { onConflict: "store_id" },
      );

    if (entitlementError) {
      console.error("Error upserting store entitlement:", entitlementError);
      res.status(500).send("Failed to grant store entitlement");
      return;
    }

    const { error: publishError } = await supabaseAdminClient
      .from("stores")
      .update({ is_published: true })
      .eq("id", storeId);

    if (publishError) {
      console.error("Error publishing paid store:", publishError);
      res.status(500).send("Failed to publish paid store");
      return;
    }

    console.log("Granted store entitlement:", {
      sessionId: session.id,
      storeId,
    });
    res.sendStatus(200);
  } catch (err) {
    console.error(
      "Error processing Stripe webhook:",
      err,
      "eventId:",
      event.id,
    );
    res.status(500).send("Failed to process Stripe webhook");
  }
};
