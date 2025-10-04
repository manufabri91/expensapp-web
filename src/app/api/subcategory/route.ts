import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { UnauthorizedError } from '@/types/exceptions/unauthorized';

export const GET = async () => {
  try {
    const session = await auth();
    if (!session) {
      throw new UnauthorizedError();
    }
    const response = await fetch(`${process.env.API_URL}/subcategory`, {
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
    const response = await fetch(`${process.env.API_URL}/subcategory`, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: {
        Authorization: session.user.token,
        ['Content-Type']: 'application/json',
      },
    });
    const newSubcategory = await response.json();

    if (!response.ok) {
      console.error('Failed to create Subcategory:', newSubcategory);
      throw new Error(newSubcategory.message || 'UNEXPECTED_ERROR');
    }

    return NextResponse.json(newSubcategory);
  } catch (error) {
    console.log(error);
    return NextResponse.error();
  }
};
