import { useState } from "react";
import { useNavigate } from "react-router";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { MapPin, Clock, Calendar, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { projectId } from "../../../utils/supabase/info";

export function CreateTrip() {
  const navigate = useNavigate();
  const [destination, setDestination] = useState("");
  const [arrivalTime, setArrivalTime] = useState("");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);
  
  const accessToken = document.querySelector("[data-access-token]")?.getAttribute("data-access-token");
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!destination || !arrivalTime || !date) {
      toast.error("Please fill in all fields");
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-c50e2f7e/trips`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ destination, arrivalTime, date }),
        }
      );
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success("Trip created successfully!");
        
        // Navigate to recommendations
        setTimeout(() => {
          navigate("/recommendations");
        }, 500);
      } else {
        console.error("Error creating trip:", data);
        toast.error(data.error || "Failed to create trip");
      }
    } catch (error) {
      console.error("Error creating trip:", error);
      toast.error("Failed to create trip");
    } finally {
      setLoading(false);
    }
  };
  
  // Set minimum date to today
  const today = new Date().toISOString().split('T')[0];
  
  return (
    <div className="pb-24 max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Create a Trip</h2>
        <p className="text-gray-600">
          Share your travel details to find carpool matches
        </p>
      </div>
      
      <Card className="p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Destination */}
          <div className="space-y-2">
            <Label htmlFor="destination" className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-green-600" />
              Destination
            </Label>
            <Input
              id="destination"
              type="text"
              placeholder="e.g., Downtown Office Plaza, 123 Main St"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="text-base"
            />
            <p className="text-sm text-gray-500">
              Enter the full address or location name
            </p>
          </div>
          
          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date" className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-green-600" />
              Travel Date
            </Label>
            <Input
              id="date"
              type="date"
              min={today}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="text-base"
            />
          </div>
          
          {/* Arrival Time */}
          <div className="space-y-2">
            <Label htmlFor="time" className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-green-600" />
              Arrival Time
            </Label>
            <Input
              id="time"
              type="time"
              value={arrivalTime}
              onChange={(e) => setArrivalTime(e.target.value)}
              className="text-base"
            />
            <p className="text-sm text-gray-500">
              What time do you need to arrive?
            </p>
          </div>
          
          {/* Info Box */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-green-900 mb-2">
              How it works
            </h4>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• Your trip will be visible to your friends</li>
              <li>• Our AI will match you with similar trips</li>
              <li>• Get recommendations based on route and timing</li>
              <li>• Save fuel and reduce carbon emissions together</li>
            </ul>
          </div>
          
          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-lg py-6"
            disabled={loading}
          >
            {loading ? "Creating Trip..." : "Create Trip & Find Matches"}
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </form>
      </Card>
      
      {/* Benefits Section */}
      <div className="mt-8 grid md:grid-cols-3 gap-4">
        <Card className="p-6 text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-2xl">🌱</span>
          </div>
          <h4 className="font-semibold mb-1">Eco-Friendly</h4>
          <p className="text-sm text-gray-600">Reduce carbon footprint</p>
        </Card>
        
        <Card className="p-6 text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-2xl">💰</span>
          </div>
          <h4 className="font-semibold mb-1">Save Money</h4>
          <p className="text-sm text-gray-600">Split fuel costs</p>
        </Card>
        
        <Card className="p-6 text-center">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-2xl">🤝</span>
          </div>
          <h4 className="font-semibold mb-1">Social</h4>
          <p className="text-sm text-gray-600">Connect with friends</p>
        </Card>
      </div>
    </div>
  );
}