import { auth } from '@/lib/auth';
import { UnauthorizedError } from '@/types/exceptions/unauthorized';
import { NextResponse } from 'next/server';

export const GET = async () => {
  try {
    const session = await auth();
    if (!session) {
      throw new UnauthorizedError();
    }
    const response = await fetch(`${process.env.API_URL}/transaction`, {
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
