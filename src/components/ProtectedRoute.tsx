// src/components/ProtectedRoute.tsx
import { Navigate } from "react-router";
import { useAuth } from "@/contexts/auth";
import type { JSX } from "react";
import { Spinner } from "./ui/spinner";

export default function ProtectedRoute({
  children,
}: {
  children: JSX.Element;
}) {
  const { user, isLoading } = useAuth();

  if (isLoading)
    return (
      <div className="grid h-dvh w-full place-items-center">
        <Spinner className="size-6 text-pink-600" />
      </div>
    );

  if (!user) return <Navigate to="/login" replace />;
  return children;
}
