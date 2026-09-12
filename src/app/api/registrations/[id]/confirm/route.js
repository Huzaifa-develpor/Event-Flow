import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import { confirmRegistrationPayment } from "@/services/registration.service";

export async function PATCH(request, { params }) {
  try {
    await connectToDB();
    const { id } = await params; // fix
    const userId = request.headers.get("x-user-id");

    const registration = await confirmRegistrationPayment(id, userId);

    return NextResponse.json({ status: "success", registration }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ status: "failed", error: error.message }, { status: 500 });
  }
}