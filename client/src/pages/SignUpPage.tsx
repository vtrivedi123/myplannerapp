import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { refresh } = useAuth();
  const signUpMutation = trpc.auth.signUp.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      await signUpMutation.mutateAsync({ email, password });
      await refresh();
      toast.success("Account created successfully!");
      window.location.href = "/";
    } catch (err: any) {
      const message = err?.message || "Failed to create account";
      setError(message);
      toast.error("Sign up failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block mb-4">
            <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center">
              <span className="text-2xl">📚</span>
            </div>
          </div>
          <h1 className="font-[Fraunces] text-3xl font-bold text-foreground mb-2">
            Planner
          </h1>
          <p className="text-sm text-muted-foreground">
            Create your college planner account
          </p>
        </div>

        {/* Form Card */}
        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-primary/20 bg-card/50 backdrop-blur-sm p-6 space-y-5 shadow-lg"
        >
          {/* Email Field */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-muted-foreground">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-2.5 rounded-lg bg-background border border-primary/30 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/60 transition-all"
            />
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-muted-foreground">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full px-4 py-2.5 rounded-lg bg-background border border-primary/30 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/60 transition-all pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-muted-foreground">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                className="w-full px-4 py-2.5 rounded-lg bg-background border border-primary/30 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/60 transition-all pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-500">
              {error}
            </div>
          )}

          {/* Sign Up Button */}
          <button
            type="submit"
            disabled={signUpMutation.isPending}
            className="w-full py-2.5 rounded-lg bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-medium text-sm transition-all hover:shadow-lg hover:shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {signUpMutation.isPending ? "Creating account..." : "Create Account"}
          </button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/40"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-card/50 text-muted-foreground">
                Already have an account?
              </span>
            </div>
          </div>

          {/* Sign In Link */}
          <p className="text-center text-sm text-muted-foreground">
            <a
              href="/account/signin"
              className="font-medium text-primary hover:text-primary/80 transition-colors"
            >
              Sign in instead
            </a>
          </p>
        </form>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          Your data is encrypted and secure
        </p>
      </div>
    </div>
  );
}
