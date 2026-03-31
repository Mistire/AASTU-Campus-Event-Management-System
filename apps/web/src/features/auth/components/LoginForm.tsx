"use client";

import { useState } from "react";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, Loader2 } from "lucide-react";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Mocking an admin login with artificial delay for premium feel
    setTimeout(() => {
      setAuth("mock-token-123", "mock-refresh-token", {
        id: "usr_1",
        full_name: "AASTU Admin",
        email: email,
        phone: "123456789",
        role: "ADMIN",
        roles: ["ADMIN"],
        user_roles: [{ role: { name: "ADMIN" } }],
      });
      setIsLoading(false);
      router.push("/dashboard");
    }, 1000);
  };

  return (
    <div className="w-full max-w-md mx-auto p-8 border border-gray-100 rounded-3xl shadow-xl shadow-gray-200/50 bg-white">
      <div className="flex flex-col items-center mb-8">
        <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center mb-4 shadow-lg shadow-blue-500/20">
          <ShieldCheck className="w-7 h-7 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
          AASTU <span className="text-blue-600">Events</span>
        </h2>
        <p className="text-gray-500 text-sm mt-2">
          Sign in to manage campus events
        </p>
      </div>

      <form onSubmit={handleLogin} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-gray-700 font-semibold ml-1">
            Email or Username
          </Label>
          <Input
            id="email"
            type="text"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setEmail(e.target.value)
            }
            placeholder="admin@aastu.edu.et"
            className="rounded-xl border-gray-200 focus:ring-blue-500/20"
            required
          />
        </div>
        <div className="space-y-2">
          <Label
            htmlFor="password"
            className="text-gray-700 font-semibold ml-1"
          >
            Password
          </Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setPassword(e.target.value)
            }
            placeholder="••••••••"
            className="rounded-xl border-gray-200 focus:ring-blue-500/20"
            required
          />
        </div>

        <div className="flex items-center justify-between text-sm px-1">
          <label className="flex items-center gap-2 text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            Remember me
          </label>
          <a href="#" className="text-blue-600 font-medium hover:underline">
            Forgot password?
          </a>
        </div>

        <Button
          type="submit"
          className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all disabled:opacity-70"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Authenticating...
            </>
          ) : (
            "Sign In"
          )}
        </Button>
      </form>

      <div className="mt-8 pt-6 border-t border-gray-100 text-center">
        <p className="text-gray-500 text-sm">
          Don't have an account?{" "}
          <a href="#" className="text-blue-600 font-semibold hover:underline">
            Contact Dean's Office
          </a>
        </p>
      </div>
    </div>
  );
}
