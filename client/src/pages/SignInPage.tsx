import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { refresh } = useAuth();
  const signInMutation = trpc.auth.signIn.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    try {
      const result = await signInMutation.mutateAsync({ email, password });
      if (result.success) {
        // Wait a moment for cookie to be set, then refresh auth state
        setTimeout(async () => {
          await refresh();
          toast.success("Signed in successfully!");
          window.location.href = "/";
        }, 500);
      }
    } catch (err: any) {
      console.error("Sign in error:", err);
      const message = err?.message || "Invalid email or password";
      setError(message);
      toast.error("Sign in failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, var(--background) 0%, var(--background) 60%, #0d1e38 100%)' }}>
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
            Sign in to your college planner
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
                placeholder="Enter your password"
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

          {/* Error Message */}
          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-500">
              {error}
            </div>
          )}

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={signInMutation.isPending}
            className="w-full py-2.5 rounded-lg bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-medium text-sm transition-all hover:shadow-lg hover:shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {signInMutation.isPending ? "Signing in..." : "Sign In"}
          </button>

          {/* Divider
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/40"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-card/50 text-muted-foreground">
                New to Planner?
              </span>
            </div>
          </div> */}

          {/* Sign Up Link */}
          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <a
              href="/account/signup"
              className="font-medium text-primary hover:text-primary/80 transition-colors"
            >
              Create one
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
