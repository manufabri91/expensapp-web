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
    const response = await fetch(`${process.env.API_URL}/subcategory/${id}`, {
      method: 'GET',
      headers: {
        Authorization: session.user.token,
      },
    });
    const subcategory = await response.json();
    return NextResponse.json(subcategory);
  } catch (error) {
    console.log(error);
    return NextResponse.error();
  }
};

export const PUT = async (_: NextRequest, { params }: { params: tParams }) => {
  const { id } = await params;
  try {
    const session = await auth();
    if (!session) {
      throw new UnauthorizedError();
    }
    const response = await fetch(`${process.env.API_URL}/subcategory/${id}`, {
      method: 'PUT',
      headers: {
        Authorization: session.user.token,
      },
    });
    const subcategory = await response.json();
    return NextResponse.json(subcategory);
  } catch (error) {
    console.log(error);
    return NextResponse.error();
  }
};

export const DELETE = async (_: NextRequest, { params }: { params: tParams }) => {
  const { id } = await params;
  try {
    const session = await auth();
    if (!session) {
      throw new UnauthorizedError();
    }
    const response = await fetch(`${process.env.API_URL}/subcategory/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: session.user.token,
      },
    });

    return response.status === 200 ? NextResponse.json({ deleted: true }) : NextResponse.error();
  } catch (error) {
    console.log(error);
    return NextResponse.error();
  }
};
