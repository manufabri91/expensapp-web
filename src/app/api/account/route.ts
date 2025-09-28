import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { UnauthorizedError } from '@/types/exceptions/unauthorized';

export const GET = async () => {
  try {
    const session = await auth();
    if (!session) {
      throw new UnauthorizedError();
    }
    const response = await fetch(`${process.env.API_URL}/account`, {
      headers: {
        Authorization: session.user.token,
      },
    });
    const accounts = await response.json();
    return NextResponse.json(accounts);
  } catch (error) {
    console.log(error);
    return NextResponse.error();
  }
};

export const POST = async (req: NextRequest) => {
  const payload = await req.json();
  try {
    const session = await auth();
    if (!session) {
      throw new UnauthorizedError();
    }
    const response = await fetch(`${process.env.API_URL}/account`, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: {
        Authorization: session.user.token,
        ['Content-Type']: 'application/json',
      },
    });
    const newTransaction = await response.json();
    return NextResponse.json(newTransaction);
  } catch (error) {
    console.log(error);
    return NextResponse.error();
  }
};
