import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import { Registration } from "@/models/Registration";

export async function GET(request, { params }) {
  try {
    await connectToDB();
    const { id } = await params;
    const userId = request.headers.get("x-user-id");

    const registration = await Registration.findOne({ _id: id, userId });

    if (!registration) {
      return NextResponse.json({ status: "failed", error: "Registration not found" }, { status: 404 });
    }

    return NextResponse.json({ status: "success", registration }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ status: "failed", error: error.message }, { status: 500 });
  }
}