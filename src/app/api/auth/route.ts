import { NextApiRequest } from "next";
import { NextResponse } from "next/server";

export const POST = async (req: NextApiRequest) => {
  const { username, password } = req.body;

  // Dummy authentication logic
  if (username === "admin" && password === "password") {
    return NextResponse.json({
      message: "Login successful",
      token: "dummy-token",
    });
  } else {
    return NextResponse.error();
  }
};
