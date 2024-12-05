import { auth } from '@/lib/auth';
import { UnauthorizedError } from '@/types/exceptions/unauthorized';
import { NextResponse } from 'next/server';

export const GET = async () => {
  try {
    const session = await auth();
    if (!session) {
      throw new UnauthorizedError();
    }
    const response = await fetch(`${process.env.API_URL}/category`, {
      headers: {
        Authorization: session.user.token,
      },
    });
    const categories = await response.json();
    return NextResponse.json(categories);
  } catch (error) {
    console.log(error);
    return NextResponse.error();
  }
};
