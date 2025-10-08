
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../../components/ui/card";
import { LoginForm } from "../../../components/auth/login-form";
import { HeartPulse, KeyRound } from "lucide-react";
import { Button } from "../../../components/ui/button";

export default function LoginPage() {
  return (
    <Card className="w-full max-w-md shadow-xl">
      <CardHeader className="text-center">
        <KeyRound className="mx-auto h-12 w-12 text-primary mb-2" />
        <CardTitle className="text-3xl font-bold">Admin & Staff Login</CardTitle>
        <CardDescription>Please enter your credentials to access the management panel.</CardDescription>
      </CardHeader>
      <CardContent>
        <LoginForm />
      </CardContent>
    </Card>
  );
}
