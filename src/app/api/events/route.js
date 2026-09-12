import { NextResponse } from "next/server";
import { generateToken } from "@/lib/jwt";
import { connectToDB } from "@/lib/mongodb";
import { createEvent, getAllEvents } from "@/services/event.service";

export async function GET() {
  try {
    await connectToDB();
    const events = await getAllEvents();
    return NextResponse.json({ status: "success", events }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ status: "failed", error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectToDB();

    const organizerId = request.headers.get("x-user-id");
    const currentRole = request.headers.get("x-user-role");
    const eventData = await request.json();

    const { event, user } = await createEvent(eventData, organizerId);

    const responseBody = { status: "success", event, role: user.role };

  
    if (user.role !== currentRole) {
      responseBody.token = generateToken(user);
    }

    return NextResponse.json(responseBody, { status: 201 });
  } catch (error) {
    return NextResponse.json({ status: "failed", error: error.message }, { status: 500 });
  }
}