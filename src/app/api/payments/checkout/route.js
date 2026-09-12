import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import { safepay } from "@/lib/safepay";
import { createOrganizerPayment, createAttendeePayment } from "@/services/payment.service";
import { Event } from "@/models/Event";



export async function POST(req) {
  try {
    await connectToDB();

    const userId = req.headers.get("x-user-id"); // body se nahi, middleware ke header se
    const { paymentType, eventId, registrationId, returnUrl } = await req.json();

    if (!userId) {
      return NextResponse.json({ status: "error", error: "Unauthorized" }, { status: 401 });
    }

    if (!returnUrl) {
      return NextResponse.json({ status: "error", error: "returnUrl missing" }, { status: 400 });
    }

    let payment;

    if (paymentType === "organizer") {
      const event = await Event.findById(eventId);
      if (!event) {
        return NextResponse.json({ status: "error", error: "Event not found" }, { status: 404 });
      }

      const estimatedRevenue = event.tickets.reduce(
        (sum, ticket) => sum + ticket.price * ticket.quantity,
        0
      );
      const amount = 5000 + 0.10 * estimatedRevenue; // FIXED_LISTING_FEE + COMMISSION_RATE

      payment = await createOrganizerPayment(userId, eventId, amount);
    } else if (paymentType === "attendee") {
      payment = await createAttendeePayment(userId, registrationId);
    } else {
      return NextResponse.json({ status: "error", error: "Invalid paymentType" }, { status: 400 });
    }

    const { token } = await safepay.payments.create({
      amount: payment.amount,
      currency: payment.currency,
    });

    const separator = returnUrl.includes("?") ? "&" : "?";

  // app/api/payments/checkout/route.js — sirf checkoutUrl wala hissa badlo
const checkoutUrl = safepay.checkout.create({
  token,
  orderId: payment._id.toString(),
  cancelUrl: `${returnUrl}?result=cancelled`,
  redirectUrl: returnUrl, // apne params mat jodo, SafePay khud ?order_id= jodega
  source: "custom",
  webhooks: true,
});

    return NextResponse.json({ status: "success", url: checkoutUrl, paymentId: payment._id });
  } catch (error) {
    console.error("[Checkout] ERROR:", error.message);
    return NextResponse.json({ status: "error", error: error.message }, { status: 400 });
  }
}