import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Car } from "lucide-react";
import { toast } from "sonner";
import { projectId, publicAnonKey } from "../../../utils/supabase/info";

interface AuthProps {
  onLogin: (token: string, user: any) => void;
}

export function Auth({ onLogin }: AuthProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (isSignUp) {
        // Sign up
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-c50e2f7e/signup`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${publicAnonKey}`,
            },
            body: JSON.stringify({ email, password, name }),
          }
        );
        
        const data = await response.json();
        
        if (!response.ok) {
          console.error("Sign up error:", data);
          toast.error(data.error || "Sign up failed");
          setLoading(false);
          return;
        }
        
        toast.success("Account created! Please sign in.");
        setIsSignUp(false);
        setPassword("");
      } else {
        // Sign in
        const { createClient } = await import("../../utils/supabase/client");
        const supabase = createClient();
        
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) {
          console.error("Sign in error:", error);
          toast.error(error.message || "Sign in failed");
          setLoading(false);
          return;
        }
        
        if (data.session) {
          // Get user profile
          const profileResponse = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-c50e2f7e/me`,
            {
              headers: {
                "Authorization": `Bearer ${data.session.access_token}`,
              },
            }
          );
          
          const profileData = await profileResponse.json();
          
          if (profileResponse.ok && profileData.user) {
            onLogin(data.session.access_token, profileData.user);
            toast.success("Welcome back!");
          } else {
            toast.error("Failed to load profile");
          }
        }
      }
    } catch (error) {
      console.error("Auth error:", error);
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Car className="w-10 h-10 text-green-600" />
            <h1 className="text-3xl font-bold text-green-600">EcoPool</h1>
          </div>
          <p className="text-gray-600">Reduce fuel, share rides</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          
          <Button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700"
            disabled={loading}
          >
            {loading ? "Loading..." : isSignUp ? "Sign Up" : "Sign In"}
          </Button>
        </form>
        
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm text-green-600 hover:underline"
          >
            {isSignUp
              ? "Already have an account? Sign in"
              : "Don't have an account? Sign up"}
          </button>
        </div>
        
        <div className="mt-6 p-4 bg-green-50 rounded-lg">
          <p className="text-sm text-green-800 font-semibold mb-2">
            Join the carpooling revolution!
          </p>
          <ul className="text-xs text-green-700 space-y-1">
            <li>• Save money on fuel</li>
            <li>• Reduce carbon emissions</li>
            <li>• Connect with friends</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}