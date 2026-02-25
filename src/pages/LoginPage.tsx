import { useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuthStore } from "@/stores/authStore";
import { useUiStore } from "@/stores/uiStore";
import { login, fetchMe } from "@/api/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Moon, Sun } from "lucide-react";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const setAuth = useAuthStore((s) => s.setAuth);
  const theme = useUiStore((s) => s.theme);
  const toggleTheme = useUiStore((s) => s.toggleTheme);
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? "/dashboard";

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginForm) {
    try {
      await login(values);
      const { user } = await fetchMe();
      setAuth(user);
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : "Login failed";
      setError("root", { message: message ?? "Invalid email or password" });
    }
  }

  return (
    <div
      className="relative flex min-h-screen items-center justify-center bg-muted/30 p-4 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url(/login-screen-background.png)" }}
    >
      <div className="absolute inset-0 bg-background/70 backdrop-blur-[1px]" aria-hidden />
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-4 top-4 z-10"
        onClick={toggleTheme}
        aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      >
        {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </Button>
      <Card className={cn("relative z-10 w-full max-w-md border-border bg-card/95 shadow-lg backdrop-blur-sm")}>
        <CardHeader className="space-y-1 text-center">
          <img src="/digi-prishi-logo.webp" alt="Digi" className="mx-auto h-36 w-auto rounded-2xl" />
          <CardTitle className="text-2xl font-bold">Digi Krishi</CardTitle>
          <CardDescription>Sign in to your tenant account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {errors.root && (
              <p className="text-sm text-destructive">{errors.root.message}</p>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full" loading={isSubmitting}>
              Sign in
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
