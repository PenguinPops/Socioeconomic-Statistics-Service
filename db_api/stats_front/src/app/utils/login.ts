// app/utils/login.ts
'use server';

import { signIn } from "@/../auth";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";

export async function authenticate(prevState: string | undefined, formData: FormData) {
    try {
      await signIn("credentials", {
        email: formData.get("email"),
        password: formData.get("password"),
        redirectTo: "/", // Let NextAuth handle the redirect
      });
    } catch (error) {
    if (error instanceof AuthError) {
        // Check the error message for common cases
        if (error.message.includes("CredentialsSignin")) {
            return "Invalid credentials.";
        }
        return "Something went wrong.";
        }
        throw error;
    }
  }