import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { UnauthorizedError } from '@/types/exceptions/unauthorized';

type tParams = Promise<{ id: string }>;

export const GET = async (_: NextRequest, { params }: { params: tParams }) => {
  const { id } = await params;

  try {
    const session = await auth();
    if (!session) {
      throw new UnauthorizedError();
    }
    const response = await fetch(`${process.env.API_URL}/category/${id}/subcategories`, {
      method: 'GET',
      headers: {
        Authorization: session.user.token,
      },
    });
    const category = await response.json();
    return NextResponse.json(category);
  } catch (error) {
    console.log(error);
    return NextResponse.error();
  }
};
