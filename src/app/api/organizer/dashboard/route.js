import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";

import {
  getOrganizerDashboard,
} from "@/services/dashboard.service";

export async function GET(request) {
  try {
    await connectToDB();

  

    const organizerId =
      request.headers.get("x-user-id");

    if (!organizerId) {
      return NextResponse.json(
        {
          success: false,
          message: "Organizer ID not found",
        },
        { status: 401 }
      );
    }

    const dashboard =
      await getOrganizerDashboard(
        organizerId
      );

    return NextResponse.json(
      {
        success: true,
        dashboard,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "Organizer Dashboard Error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error.message ||
          "Failed to load dashboard",
      },
      { status: 500 }
    );
  }
}