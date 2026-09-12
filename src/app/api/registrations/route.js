import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import { createRegistration } from "@/services/registration.service";

export async function POST(request) {
  try {
    await connectToDB();
    const userId = request.headers.get("x-user-id");
    const data = await request.json();

    const registration = await createRegistration(data, userId);

    return NextResponse.json({ status: "success", registration }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ status: "failed", error: error.message }, { status: 500 });
  }
}