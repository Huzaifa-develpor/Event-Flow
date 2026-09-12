import { NextResponse } from 'next/server';
import { loginUser } from "@/services/authservice"
import { connectToDB } from '@/lib/mongodb';

export async function POST(req) {
  try {
    connectToDB()
    const body = await req.json();
    const { email, password } = body;

    const result = await loginUser(email, password);

    return NextResponse.json({
      status: 'success',
      token: result.token,
      role:result.role
    });
  } catch (error) {
    return NextResponse.json(
      { status: 'error', error: error.message || 'Server Side Error' },
      { status: 400 }
    );
  }
}