import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import { updateEventStatus } from "@/services/event.service";

export async function PATCH(request, { params }) {
  try {
    await connectToDB();

    const { id } = await params;

    const organizerId = request.headers.get("x-user-id");

    if (!organizerId) {
      return NextResponse.json(
        {
          status: "failed",
          error: "Organizer ID not found",
        },
        { status: 401 }
      );
    }

    const event = await updateEventStatus(
      id,
      organizerId,
      "published"
    );

    return NextResponse.json(
      {
        status: "success",
        event,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: "failed",
        error: error.message,
      },
      { status: 500 }
    );
  }
}