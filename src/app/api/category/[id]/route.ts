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
    const response = await fetch(`${process.env.API_URL}/category/${id}`, {
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

export const PUT = async (req: NextRequest, { params }: { params: tParams }) => {
  const { id } = await params;
  const payload = await req.json();
  try {
    const session = await auth();
    if (!session) {
      throw new UnauthorizedError();
    }
    const response = await fetch(`${process.env.API_URL}/category/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
      headers: {
        Authorization: session.user.token,
        ['Content-Type']: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to update category');
    }

    const category = await response.json();
    return NextResponse.json(category);
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
    const response = await fetch(`${process.env.API_URL}/category/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: session.user.token,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete category');
    }

    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.log(error);
    return NextResponse.error();
  }
};
