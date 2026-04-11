import { Suspense } from "react";
import { AuthForm } from "@/components/auth/auth-form";
import { AuthLoadingFallback } from "@/components/auth/auth-loading-fallback";

export default function AuthPage() {
  return (
    <Suspense fallback={<AuthLoadingFallback />}>
      <AuthForm />
    </Suspense>
  );
}
