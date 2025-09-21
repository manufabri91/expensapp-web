import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { UnauthorizedError } from '@/types/exceptions/unauthorized';

export const GET = async () => {
  try {
    const session = await auth();
    if (!session) {
      throw new UnauthorizedError();
    }
    const response = await fetch(`${process.env.API_URL}/summary/totals-by-category`, {
      headers: {
        Authorization: session.user.token,
      },
    });
    const summary = await response.json();
    return NextResponse.json(summary);
  } catch (error) {
    console.log(error);
    return NextResponse.error();
  }
};
