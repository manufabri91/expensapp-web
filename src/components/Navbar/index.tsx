"use client";

import { Button, ButtonType } from "@/components";

export const Navbar = () => {
  return (
    <header className="flex justify-between items-center bg-emerald-800 dark:bg-slate-800 text-stone-100 p-4">
      <h1 className="text-xl font-bold">e-XpensApp</h1>
      <div className="flex gap-1">
        <Button
          type={ButtonType.Secondary}
          label="Register"
          onClick={() => {
            console.log("Register");
          }}
        />
        <Button
          type={ButtonType.Primary}
          label="Login"
          onClick={() => {
            console.log("Register");
          }}
        />
      </div>
    </header>
  );
};
