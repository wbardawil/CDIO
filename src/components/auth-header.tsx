"use client";

import { Show, SignInButton, UserButton } from "@clerk/nextjs";

export function AuthHeader() {
  return (
    <div>
      <Show when="signed-out">
        <SignInButton mode="modal">
          <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
            Sign In
          </button>
        </SignInButton>
      </Show>
      <Show when="signed-in">
        <UserButton />
      </Show>
    </div>
  );
}
