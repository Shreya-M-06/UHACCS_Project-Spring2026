import { useState, useEffect } from "react";
import { RouterProvider } from "react-router";
import { router } from "./routes";
import { Toaster } from "./components/ui/sonner";
import { Auth } from "./components/Auth";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      const token = localStorage.getItem("accessToken");
      const user = localStorage.getItem("currentUser");
      
      if (token && user) {
        setAccessToken(token);
        setCurrentUser(JSON.parse(user));
        setIsAuthenticated(true);
      }
      
      setLoading(false);
    };
    
    checkSession();
  }, []);
  
  const handleLogin = (token: string, user: any) => {
    setAccessToken(token);
    setCurrentUser(user);
    setIsAuthenticated(true);
    localStorage.setItem("accessToken", token);
    localStorage.setItem("currentUser", JSON.stringify(user));
  };
  
  const handleLogout = () => {
    setAccessToken(null);
    setCurrentUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("currentUser");
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return (
      <>
        <Auth onLogin={handleLogin} />
        <Toaster position="top-center" />
      </>
    );
  }
  
  // Provide auth context to child components
  return (
    <>
      <div data-access-token={accessToken} data-current-user-id={currentUser?.id}>
        <RouterProvider router={router} />
      </div>
      <Toaster position="top-center" />
    </>
  );
}