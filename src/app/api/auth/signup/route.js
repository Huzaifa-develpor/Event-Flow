import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import { signupUser } from "@/services/authservice";

export async function POST(request) {
    try {
        await connectToDB();

        const data = await request.json();
        const result = await signupUser(data);

        return NextResponse.json(
            {
                status: "success",
                user: result,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Signup error:", error);

        return NextResponse.json(
            {
                status: "failed",
                message: "Unable to create account",
            },
            { status: 500 }
        );
    }
}