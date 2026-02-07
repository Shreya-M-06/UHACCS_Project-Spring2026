import { useState, useEffect } from "react";
import { Trip } from "../data/mockData";
import { findCarpoolMatches } from "../utils/matchingAlgorithm";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Sparkles, MapPin, Clock, Calendar, MessageCircle, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { projectId } from "../../../utils/supabase/info";

export function Recommendations() {
  const [userTrips, setUserTrips] = useState<Trip[]>([]);
  const [allTrips, setAllTrips] = useState<Trip[]>([]);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
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
        const trips = myTripsData.trips || [];
        setUserTrips(trips);
        if (trips.length > 0 && !selectedTripId) {
          setSelectedTripId(trips[0].id);
        }
      }
      
      // Fetch all trips for matching
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
        setAllTrips(allTripsData.trips || []);
      }
    } catch (error) {
      console.error("Error fetching trips:", error);
      toast.error("Failed to load trips");
    } finally {
      setLoading(false);
    }
  };
  
  const selectedTrip = userTrips.find(t => t.id === selectedTripId);
  const matches = selectedTrip ? findCarpoolMatches(selectedTrip, allTrips) : [];
  
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { 
      weekday: "short", 
      month: "short", 
      day: "numeric" 
    });
  };
  
  const getMatchColor = (score: number) => {
    if (score >= 80) return "bg-green-100 text-green-700";
    if (score >= 60) return "bg-blue-100 text-blue-700";
    if (score >= 40) return "bg-yellow-100 text-yellow-700";
    return "bg-gray-100 text-gray-700";
  };
  
  const handleContactMatch = (match: any) => {
    toast.success(`Opening chat with ${match.trip.userName}...`);
  };
  
  if (userTrips.length === 0) {
    return (
      <div className="pb-24">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">AI Recommendations</h2>
          <p className="text-gray-600">
            Smart carpool matching powered by AI
          </p>
        </div>
        
        <Card className="p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No trips to match</h3>
            <p className="text-gray-600 mb-6">
              Create a trip first to get AI-powered carpool recommendations
            </p>
            <Button 
              onClick={() => window.location.href = "/create-trip"}
              className="bg-green-600 hover:bg-green-700"
            >
              Create a Trip
            </Button>
          </div>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="pb-24">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          <Sparkles className="inline w-8 h-8 text-purple-600 mr-2" />
          AI Recommendations
        </h2>
        <p className="text-gray-600">
          Smart carpool matching based on destination and timing
        </p>
      </div>
      
      {/* Trip Selector */}
      <Card className="p-4 mb-6">
        <Label className="text-sm font-medium mb-2 block">Select your trip:</Label>
        <div className="space-y-2">
          {userTrips.map((trip) => (
            <button
              key={trip.id}
              onClick={() => setSelectedTripId(trip.id)}
              className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${
                selectedTripId === trip.id
                  ? "border-green-600 bg-green-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-start gap-2 mb-1">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <p className="font-medium text-sm">{trip.destination}</p>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500 ml-6">
                    <span>{formatDate(trip.date)}</span>
                    <span>•</span>
                    <span>{trip.arrivalTime}</span>
                  </div>
                </div>
                {selectedTripId === trip.id && (
                  <Badge className="bg-green-600 text-white">Selected</Badge>
                )}
              </div>
            </button>
          ))}
        </div>
      </Card>
      
      {/* Matches */}
      {matches.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No matches found</h3>
            <p className="text-gray-600">
              We couldn't find any matching trips for this destination and time. Try adding more friends or check back later!
            </p>
          </div>
        </Card>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">
              Found {matches.length} {matches.length === 1 ? "Match" : "Matches"}
            </h3>
            <Badge className="bg-purple-100 text-purple-700">
              AI Powered
            </Badge>
          </div>
          
          <div className="space-y-4">
            {matches.map((match, index) => (
              <Card key={match.trip.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                        {match.trip.userName.charAt(0)}
                      </div>
                      {index === 0 && match.matchScore >= 80 && (
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                          <span className="text-xs">⭐</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-lg">{match.trip.userName}</p>
                      <p className="text-sm text-gray-500">Friend</p>
                    </div>
                  </div>
                  
                  <Badge className={getMatchColor(match.matchScore)}>
                    {match.matchScore}% Match
                  </Badge>
                </div>
                
                <div className="space-y-3 mb-4">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-gray-900">{match.trip.destination}</p>
                      <p className="text-sm text-green-600 font-medium mt-1">
                        {match.reason}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <p className="text-gray-600">Arrive by {match.trip.arrivalTime}</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <p className="text-gray-600">{formatDate(match.trip.date)}</p>
                  </div>
                </div>
                
                <Button
                  onClick={() => handleContactMatch(match)}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Contact {match.trip.userName.split(' ')[0]}
                </Button>
              </Card>
            ))}
          </div>
          
          {/* Info about matching */}
          <Card className="mt-6 p-4 bg-purple-50 border-purple-200">
            <div className="flex gap-3">
              <Sparkles className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-purple-900 mb-1">
                  How AI Matching Works
                </h4>
                <p className="text-sm text-purple-800">
                  Our algorithm analyzes destinations, routes, and arrival times to find the best carpool matches. 
                  Higher match scores mean more compatible trips that can help you save fuel and reduce emissions.
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

function Label({ children, className = "", ...props }: any) {
  return (
    <label className={`text-sm font-medium ${className}`} {...props}>
      {children}
    </label>
  );
}
