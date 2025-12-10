"use client";

import { SignUp } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900">
      <SignUp
        appearance={{
          baseTheme: dark,
          elements: {
            footerActionLink: { color: "white" },
          },
        }}
        signUpFields={[
          { name: "email_address", enabled: true },
          { name: "password", enabled: true },
          { name: "phone_number", enabled: false },
        ]}
        redirectUrl="/"          // 👈 Redirect to home page
        afterSignUpUrl="/"       // 👈 Redirect after sign-up completion
      />
    </div>
  );
}


