import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { title } from "@/constants";
import { Navigate } from "react-router";
import { useAuth } from "@/contexts/auth";

const Login = () => {
  const { user } = useAuth();
  if (user) return <Navigate to="/" replace />;

  return (
    <div className="h-dvh w-full bg-stone-200">
      <div className="mx-auto max-w-screen-xl px-4">
        <nav className="py-4">
          <div className="font-semibold">{title}</div>
        </nav>
        <Card className="mx-auto mt-28 max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Welcome to {title}</CardTitle>
            <CardDescription>
              Sign in to create your menu in minutes.
            </CardDescription>
          </CardHeader>
          <CardFooter className="mt-6 flex justify-center">
            <Button>Continue with Google</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;
