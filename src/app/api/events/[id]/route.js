import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import { getEventById } from "@/services/event.service";

export async function GET(request, { params }) {
  try {
    await connectToDB();
    const { id } = await params;
    const event = await getEventById(id);
    return NextResponse.json({ status: "success", event }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ status: "failed", error: error.message }, { status: 404 });
  }
}