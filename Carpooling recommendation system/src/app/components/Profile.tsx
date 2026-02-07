import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { User, Mail, Car, Users, Leaf, Award } from "lucide-react";

export function Profile() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  useEffect(() => {
    const userData = localStorage.getItem("currentUser");
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    }
  }, []);
  
  if (!currentUser) {
    return null;
  }
  
  const stats = {
    totalTrips: 12,
    carpoolsJoined: 8,
    co2Saved: 45.6, // kg
    friends: 5,
  };
  
  return (
    <div className="pb-24 max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Profile</h2>
        <p className="text-gray-600">
          Your carpooling journey and impact
        </p>
      </div>
      
      {/* Profile Card */}
      <Card className="p-8 mb-6">
        <div className="flex items-center gap-6 mb-6">
          <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white text-4xl font-bold">
            {currentUser.name.charAt(0)}
          </div>
          <div>
            <h3 className="text-2xl font-bold mb-1">{currentUser.name}</h3>
            <p className="text-gray-600 flex items-center gap-2 mb-2">
              <Mail className="w-4 h-4" />
              {currentUser.email}
            </p>
            <Badge className="bg-green-100 text-green-700">Active Member</Badge>
          </div>
        </div>
        
        <div className="grid md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <Car className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-900">{stats.totalTrips}</p>
            <p className="text-sm text-blue-700">Total Trips</p>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <Users className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-purple-900">{stats.carpoolsJoined}</p>
            <p className="text-sm text-purple-700">Carpools Joined</p>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <Leaf className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-900">{stats.co2Saved} kg</p>
            <p className="text-sm text-green-700">CO₂ Saved</p>
          </div>
          
          <div className="bg-orange-50 rounded-lg p-4 text-center">
            <Award className="w-8 h-8 text-orange-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-orange-900">{stats.friends}</p>
            <p className="text-sm text-orange-700">Friends</p>
          </div>
        </div>
      </Card>
      
      {/* Environmental Impact */}
      <Card className="p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Leaf className="w-6 h-6 text-green-600" />
          Environmental Impact
        </h3>
        
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-700">CO₂ Reduction Goal</span>
              <span className="font-semibold">45.6 / 100 kg</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all"
                style={{ width: '45.6%' }}
              />
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-4 mt-6">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-3xl mb-1">🌳</p>
              <p className="text-sm font-semibold text-green-900">2.3 trees</p>
              <p className="text-xs text-green-700">equivalent saved</p>
            </div>
            
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-3xl mb-1">⛽</p>
              <p className="text-sm font-semibold text-blue-900">18.2 liters</p>
              <p className="text-xs text-blue-700">fuel saved</p>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-3xl mb-1">💰</p>
              <p className="text-sm font-semibold text-purple-900">$45.60</p>
              <p className="text-xs text-purple-700">money saved</p>
            </div>
          </div>
        </div>
      </Card>
      
      {/* Achievements */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Award className="w-6 h-6 text-yellow-600" />
          Achievements
        </h3>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-4 bg-yellow-50 rounded-lg border-2 border-yellow-200">
            <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center text-2xl">
              🚀
            </div>
            <div>
              <p className="font-semibold text-yellow-900">First Trip</p>
              <p className="text-sm text-yellow-700">Created your first carpool trip</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border-2 border-green-200">
            <div className="w-12 h-12 bg-green-400 rounded-full flex items-center justify-center text-2xl">
              🌱
            </div>
            <div>
              <p className="font-semibold text-green-900">Eco Warrior</p>
              <p className="text-sm text-green-700">Saved 40+ kg of CO₂</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
            <div className="w-12 h-12 bg-blue-400 rounded-full flex items-center justify-center text-2xl">
              👥
            </div>
            <div>
              <p className="font-semibold text-blue-900">Social Butterfly</p>
              <p className="text-sm text-blue-700">Added 5+ friends</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-4 bg-gray-100 rounded-lg border-2 border-gray-300 opacity-50">
            <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center text-2xl">
              🔒
            </div>
            <div>
              <p className="font-semibold text-gray-600">Regular Carpooler</p>
              <p className="text-sm text-gray-500">Join 20 carpools (8/20)</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}