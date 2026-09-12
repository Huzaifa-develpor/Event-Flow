import { NextResponse } from "next/server";

export const roleMiddleware = (user, allowedRoles) => {
  if (!allowedRoles.includes(user.role)) {
    return NextResponse.json(
      {
        success: false,
        message: "Access denied",
      },
      { status: 403 }
    );
  }

  return null;
};