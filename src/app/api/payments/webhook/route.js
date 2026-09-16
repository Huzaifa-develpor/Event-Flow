import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import { updatePaymentStatus } from "@/services/payment.service";
import { confirmRegistrationPayment } from "@/services/registration.service";
import { updateEventStatus } from "@/services/event.service";

export async function POST(req) {
  try {
    await connectToDB();

    const rawBody = await req.text();
    const event = JSON.parse(rawBody);



    const notification = event?.data?.notification;
    const paymentId = notification?.metadata?.order_id;
    const state = notification?.state;
    const transactionId = notification?.tracker;

    console.log("[Webhook] state:", state, "| paymentId:", paymentId);

    if (!paymentId) {
      return NextResponse.json({ error: "Missing paymentId" }, { status: 400 });
    }

    if (state === "payment.succeeded") {
      const payment = await updatePaymentStatus(paymentId, "completed", transactionId);

      if (payment.paymentType === "attendee") {
        await confirmRegistrationPayment(payment.registrationId, payment.userId);
        console.log("[Webhook] Registration confirmed + ticket generated:", payment.registrationId);
      } else if (payment.paymentType === "organizer") {
        await updateEventStatus(payment.eventId, payment.userId, "published");
        console.log("[Webhook] Event published:", payment.eventId);
      }
    } else if (state === "FAILED") {
      await updatePaymentStatus(paymentId, "failed");
      console.log("[Webhook] Payment marked FAILED:", paymentId);
    } else {
      console.log("[Webhook] Unhandled state:", state);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[Webhook] ERROR:", error.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
} 