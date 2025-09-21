import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { UnauthorizedError } from '@/types/exceptions/unauthorized';

export const GET = async (request: NextRequest) => {
  try {
    const session = await auth();
    if (!session) {
      throw new UnauthorizedError();
    }
    const queryParams = request.nextUrl.searchParams.size > 0 ? `?${request.nextUrl.searchParams.toString()}` : '';
    const response = await fetch(`${process.env.API_URL}/transaction${queryParams}`, {
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
    const response = await fetch(`${process.env.API_URL}/transaction`, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: {
        Authorization: session.user.token,
        ['Content-Type']: 'application/json',
      },
    });
    const newTransaction = await response.json();

    if (!response.ok) {
      console.error('Failed to create transaction:', newTransaction);
      throw new Error(newTransaction.message || 'UNEXPECTED_ERROR');
    }

    return NextResponse.json(newTransaction);
  } catch (error) {
    console.log(error);
    return NextResponse.error();
  }
};
