import { auth } from '@/lib/auth';
import { UnauthorizedError } from '@/types/exceptions/unauthorized';
import { NextRequest, NextResponse } from 'next/server';

export const GET = async (request: NextRequest) => {
  try {
    const session = await auth();
    if (!session) {
      throw new UnauthorizedError();
    }
    const queryParams = request.nextUrl.searchParams.size > 0 ? `?${request.nextUrl.searchParams.toString()}` : '';
    const response = await fetch(`${process.env.API_URL}/summary${queryParams}`, {
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
