// app/api/payments/[id]/route.js
import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import { Payment } from "@/models/Payment";

export async function GET(req, { params }) {
  try {
    await connectToDB();

    const { id } = await params; // yahi fix hai — await lagana zaroori hai

    const payment = await Payment.findById(id);
    if (!payment) {
      return NextResponse.json({ status: "error", error: "Payment not found" }, { status: 404 });
    }
    return NextResponse.json({ status: "success", payment });
  } catch (error) {
    return NextResponse.json({ status: "error", error: error.message }, { status: 500 });
  }
}