import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { UnauthorizedError } from '@/types/exceptions/unauthorized';

type tParams = Promise<{ months: string }>;

export const GET = async (_: NextRequest, { params }: { params: tParams }) => {
  const { months } = await params;

  try {
    const session = await auth();
    if (!session) {
      throw new UnauthorizedError();
    }
    const response = await fetch(`${process.env.API_URL}/summary/monthly-history/${months}`, {
      method: 'GET',
      headers: {
        Authorization: session.user.token,
      },
    });
    const account = await response.json();
    return NextResponse.json(account);
  } catch (error) {
    console.log(error);
    return NextResponse.error();
  }
};
