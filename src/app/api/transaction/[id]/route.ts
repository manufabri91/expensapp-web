import { auth } from '@/lib/auth';
import { UnauthorizedError } from '@/types/exceptions/unauthorized';
import { NextRequest, NextResponse } from 'next/server';

type tParams = Promise<{ id: string }>;

export const GET = async (_: NextRequest, { params }: { params: tParams }) => {
  const { id } = await params;

  try {
    const session = await auth();
    if (!session) {
      throw new UnauthorizedError();
    }
    const response = await fetch(`${process.env.API_URL}/transaction/${id}`, {
      method: 'GET',
      headers: {
        Authorization: session.user.token,
      },
    });
    const transaction = await response.json();
    return NextResponse.json(transaction);
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
    const response = await fetch(`${process.env.API_URL}/transaction/${id}`, {
      method: 'PUT',
      headers: {
        Authorization: session.user.token,
      },
    });
    const transaction = await response.json();
    return NextResponse.json(transaction);
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
    const response = await fetch(`${process.env.API_URL}/transaction/${id}`, {
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
