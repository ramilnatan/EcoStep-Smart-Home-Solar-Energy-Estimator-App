import { useState } from "react";
import { GlassCard } from "./ui/GlassCard";
import { X } from "lucide-react";
import { supabase } from "../lib/supabase";

type LoginModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function LoginModal({
  isOpen,
  onClose,
}: LoginModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);
  
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
  
      if (error) throw error;
  
      alert("🎉 Login successful!");
  
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <GlassCard className="relative w-full max-w-xl p-8">

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-3xl font-bold text-center text-white">
          Welcome Back
        </h2>

        <p className="mt-3 text-center text-gray-400">
          Sign in to continue to EcoStep.
        </p>

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Business Email"
          className="mt-8 w-full rounded-xl border border-white/10 bg-dark-700 p-4 text-white"
        />

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="mt-5 w-full rounded-xl border border-white/10 bg-dark-700 p-4 text-white"
        />

        <button
          onClick={handleLogin}
          disabled={loading}
          className="mt-8 w-full rounded-xl bg-gradient-to-r from-eco-green to-eco-cyan py-4 font-semibold text-black"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="mt-4 text-center text-sm text-eco-cyan cursor-pointer hover:underline">
           Forgot Password?
        </p>
        <div className="my-6 border-t border-white/10"></div>

        <p className="text-center text-sm text-gray-400">
           Don't have an account?
        </p>

        <button
          className="mt-3 w-full rounded-xl border border-white/10 py-3 text-gray-300 hover:bg-white/5"
        >
           Start Free Trial
        </button>

      </GlassCard>
    </div>
  );
}
