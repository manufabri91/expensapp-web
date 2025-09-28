import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { UnauthorizedError } from '@/types/exceptions/unauthorized';

type tParams = Promise<{ year: string; month: string }>;

export const GET = async (_: NextRequest, { params }: { params: tParams }) => {
  const { year, month } = await params;

  try {
    const session = await auth();
    if (!session) {
      throw new UnauthorizedError();
    }
    const response = await fetch(`${process.env.API_URL}/summary/totals-by-category/${year}/${month}`, {
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
