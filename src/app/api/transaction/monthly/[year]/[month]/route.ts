import { auth } from '@/lib/auth';
import { UnauthorizedError } from '@/types/exceptions/unauthorized';
import { NextRequest, NextResponse } from 'next/server';

type tParams = Promise<{ year: string; month: string }>;

export const GET = async (_: NextRequest, { params }: { params: tParams }) => {
  const { year, month } = await params;
  try {
    const session = await auth();
    if (!session) {
      throw new UnauthorizedError();
    }
    const response = await fetch(`${process.env.API_URL}/transaction/${year}/${month}`, {
      headers: {
        Authorization: session.user.token,
      },
    });
    const transactions = await response.json();
    return NextResponse.json(transactions);
  } catch (error) {
    console.log(error);
    return NextResponse.error();
  }
};
