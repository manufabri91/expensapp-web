import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { UnauthorizedError } from '@/types/exceptions/unauthorized';


type tParams = Promise<{ year: string }>;

export const GET = async (_: NextRequest, { params }: { params: tParams }) => {    
  const { year } = await params;

  try {
    const session = await auth();
    if (!session) {
      throw new UnauthorizedError();
    }
    const response = await fetch(`${process.env.API_URL}/summary/${year}`, {
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
