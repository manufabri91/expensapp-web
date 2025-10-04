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
    const response = await fetch(`${process.env.API_URL}/account/${id}`, {
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

export const PUT = async (req: NextRequest, { params }: { params: tParams }) => {
  const { id } = await params;
  const payload = await req.json();

  try {
    const session = await auth();
    if (!session) {
      throw new UnauthorizedError();
    }
    const response = await fetch(`${process.env.API_URL}/account/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
      headers: {
        Authorization: session.user.token,
        ['Content-Type']: 'application/json',
      },
    });
    const newAccount = await response.json();

    if (!response.ok) {
      console.error('Failed to edit Account:', newAccount);
      throw new Error(newAccount.message || 'UNEXPECTED_ERROR');
    }

    return NextResponse.json(newAccount);
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
    const response = await fetch(`${process.env.API_URL}/account/${id}`, {
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
