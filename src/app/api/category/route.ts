import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { UnauthorizedError } from '@/types/exceptions/unauthorized';

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

export const POST = async (req: NextRequest) => {
  const payload = await req.json();
  try {
    const session = await auth();
    if (!session) {
      throw new UnauthorizedError();
    }
    const response = await fetch(`${process.env.API_URL}/category`, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: {
        Authorization: session.user.token,
        ['Content-Type']: 'application/json',
      },
    });
    const newCategory = await response.json();

    if (!response.ok) {
      console.error('Failed to create Subcategory:', newCategory);
      throw new Error(newCategory.message || 'UNEXPECTED_ERROR');
    }
    return NextResponse.json(newCategory);
  } catch (error) {
    console.log(error);
    return NextResponse.error();
  }
};
