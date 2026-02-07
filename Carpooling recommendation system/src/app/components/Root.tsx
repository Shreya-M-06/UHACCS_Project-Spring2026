import { Outlet, Link, useLocation } from "react-router";
import { Car, Users, PlusCircle, Sparkles, User, LogOut } from "lucide-react";
import { Button } from "./ui/button";

export function Root() {
  const location = useLocation();
  
  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };
  
  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("currentUser");
    window.location.reload();
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Car className="w-8 h-8 text-green-600" />
            <h1 className="text-2xl font-bold text-green-600">EcoPool</h1>
          </div>
          <div className="flex items-center gap-4">
            <p className="text-sm text-gray-600">Reduce fuel, share rides</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-gray-600 hover:text-red-600"
            >
              <LogOut className="w-4 h-4 mr-1" />
              Logout
            </Button>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <Outlet />
      </main>
      
      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-around items-center py-2">
            <Link
              to="/"
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
                isActive("/") 
                  ? "text-green-600 bg-green-50" 
                  : "text-gray-600 hover:text-green-600"
              }`}
            >
              <Car className="w-6 h-6" />
              <span className="text-xs">Trips</span>
            </Link>
            
            <Link
              to="/friends"
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
                isActive("/friends") 
                  ? "text-green-600 bg-green-50" 
                  : "text-gray-600 hover:text-green-600"
              }`}
            >
              <Users className="w-6 h-6" />
              <span className="text-xs">Friends</span>
            </Link>
            
            <Link
              to="/create-trip"
              className={`flex flex-col items-center gap-1 px-6 py-2 rounded-lg transition-colors ${
                isActive("/create-trip") 
                  ? "text-white bg-green-600" 
                  : "text-white bg-green-500 hover:bg-green-600"
              }`}
            >
              <PlusCircle className="w-7 h-7" />
              <span className="text-xs">New Trip</span>
            </Link>
            
            <Link
              to="/recommendations"
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
                isActive("/recommendations") 
                  ? "text-green-600 bg-green-50" 
                  : "text-gray-600 hover:text-green-600"
              }`}
            >
              <Sparkles className="w-6 h-6" />
              <span className="text-xs">Matches</span>
            </Link>
            
            <Link
              to="/profile"
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
                isActive("/profile") 
                  ? "text-green-600 bg-green-50" 
                  : "text-gray-600 hover:text-green-600"
              }`}
            >
              <User className="w-6 h-6" />
              <span className="text-xs">Profile</span>
            </Link>
          </div>
        </div>
      </nav>
    </div>
  );
}