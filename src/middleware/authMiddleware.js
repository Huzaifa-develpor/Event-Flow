import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export const authMiddleware = (request) => {
  try {
    const authHeader =
      request.headers.get("authorization") ||
      request.headers.get("Authorization");

    let token = null;

    if (authHeader) {
      const [type, BearerToken] = authHeader.split(" ");
      if (type === "Bearer") {
        token = BearerToken;
      }
    }

    if (!token) {
      token = request.cookies.get("token")?.value;
    }

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Authorization token is required",
        },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    return {
      userId: decoded.id || decoded.userId || decoded._id,
      role: decoded.role,
    };
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Invalid or expired token",
      },
      { status: 401 }
    );
  }
};