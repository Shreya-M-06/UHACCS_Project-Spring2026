import { useState, useEffect } from "react";
import { Trip } from "../data/mockData";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { MapPin, Clock, Calendar, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { projectId } from "../../../utils/supabase/info";

export function Home() {
  const [myTrips, setMyTrips] = useState<Trip[]>([]);
  const [communityTrips, setCommunityTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  
  const accessToken = document.querySelector("[data-access-token]")?.getAttribute("data-access-token");
  
  useEffect(() => {
    fetchTrips();
  }, []);
  
  const fetchTrips = async () => {
    try {
      // Fetch user's trips
      const myTripsResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-c50e2f7e/trips`,
        {
          headers: {
            "Authorization": `Bearer ${accessToken}`,
          },
        }
      );
      
      const myTripsData = await myTripsResponse.json();
      
      if (myTripsResponse.ok) {
        setMyTrips(myTripsData.trips || []);
      }
      
      // Fetch all trips (for community view)
      const allTripsResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-c50e2f7e/all-trips`,
        {
          headers: {
            "Authorization": `Bearer ${accessToken}`,
          },
        }
      );
      
      const allTripsData = await allTripsResponse.json();
      
      if (allTripsResponse.ok) {
        setCommunityTrips(allTripsData.trips || []);
      }
    } catch (error) {
      console.error("Error fetching trips:", error);
      toast.error("Failed to load trips");
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteTrip = async (tripId: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-c50e2f7e/trips/${tripId}`,
        {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
          },
        }
      );
      
      if (response.ok) {
        setMyTrips(myTrips.filter(t => t.id !== tripId));
        toast.success("Trip deleted successfully");
      } else {
        toast.error("Failed to delete trip");
      }
    } catch (error) {
      console.error("Error deleting trip:", error);
      toast.error("Failed to delete trip");
    }
  };
  
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { 
      weekday: "short", 
      month: "short", 
      day: "numeric" 
    });
  };
  
  if (loading) {
    return (
      <div className="pb-24 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading trips...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="pb-24">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Trips</h2>
        <p className="text-gray-600">
          Manage your upcoming carpooling trips
        </p>
      </div>
      
      {myTrips.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No trips yet</h3>
            <p className="text-gray-600 mb-6">
              Create your first trip to start carpooling and reducing fuel consumption
            </p>
            <Button 
              onClick={() => window.location.href = "/create-trip"}
              className="bg-green-600 hover:bg-green-700"
            >
              Create Your First Trip
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {myTrips.map((trip) => (
            <Card key={trip.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                      Your Trip
                    </Badge>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-900">{trip.destination}</p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      <p className="text-gray-600">Arrive by {trip.arrivalTime}</p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      <p className="text-gray-600">{formatDate(trip.date)}</p>
                    </div>
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteTrip(trip.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
      
      <div className="mt-12">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Community Trips</h3>
        <p className="text-gray-600 mb-6">
          See where others are heading - you might find a carpool match!
        </p>
        
        {communityTrips.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-gray-600">No community trips available yet</p>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {communityTrips.map((trip) => (
              <Card key={trip.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="mb-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white font-semibold">
                      {trip.userName?.charAt(0) || "?"}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{trip.userName}</p>
                      <p className="text-sm text-gray-500">Community Member</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-900">{trip.destination}</p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      <p className="text-gray-600">Arrive by {trip.arrivalTime}</p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      <p className="text-gray-600">{formatDate(trip.date)}</p>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
