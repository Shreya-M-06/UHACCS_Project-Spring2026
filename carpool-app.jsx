import React, { useState, useEffect, useRef } from 'react';
import { Car, Users, MapPin, Clock, UserPlus, Check, X, Sparkles, Navigation, Home, MessageCircle, Calendar, Key, Route, Search } from 'lucide-react';

const CarpoolApp = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([
    { id: 1, name: 'Alice Johnson', friends: [], friendRequests: [] },
    { id: 2, name: 'Bob Smith', friends: [], friendRequests: [] },
    { id: 3, name: 'Carol Davis', friends: [], friendRequests: [] },
    { id: 4, name: 'David Wilson', friends: [], friendRequests: [] },
    { id: 5, name: 'Emma Brown', friends: [], friendRequests: [] }
  ]);
  const [trips, setTrips] = useState([]);
  const [activeTab, setActiveTab] = useState('home');
  const [newTrip, setNewTrip] = useState({
    destination: '',
    destinationCoords: null,
    arrivalTime: '',
    departureDate: '',
    startLocation: '',
    startCoords: null,
    hasCarAvailable: false
  });
  const [recommendations, setRecommendations] = useState([]);
  
  // Location search state
  const [startLocationSuggestions, setStartLocationSuggestions] = useState([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState([]);
  const [showStartSuggestions, setShowStartSuggestions] = useState(false);
  const [showDestSuggestions, setShowDestSuggestions] = useState(false);
  const [searchingStart, setSearchingStart] = useState(false);
  const [searchingDest, setSearchingDest] = useState(false);
  const startSearchTimeout = useRef(null);
  const destSearchTimeout = useRef(null);

  // Search locations using OpenStreetMap Nominatim API (free)
  const searchLocation = async (query, isStart = true) => {
    if (!query || query.length < 3) {
      if (isStart) {
        setStartLocationSuggestions([]);
        setShowStartSuggestions(false);
      } else {
        setDestinationSuggestions([]);
        setShowDestSuggestions(false);
      }
      return;
    }

    try {
      if (isStart) setSearchingStart(true);
      else setSearchingDest(true);

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`,
        {
          headers: {
            'Accept': 'application/json',
          }
        }
      );
      
      const data = await response.json();
      
      const suggestions = data.map(place => ({
        display_name: place.display_name,
        lat: parseFloat(place.lat),
        lon: parseFloat(place.lon),
        address: place.address
      }));

      if (isStart) {
        setStartLocationSuggestions(suggestions);
        setShowStartSuggestions(true);
      } else {
        setDestinationSuggestions(suggestions);
        setShowDestSuggestions(true);
      }
    } catch (error) {
      console.error('Location search error:', error);
    } finally {
      if (isStart) setSearchingStart(false);
      else setSearchingDest(false);
    }
  };

  // Handle location input change with debouncing
  const handleLocationInput = (value, isStart = true) => {
    if (isStart) {
      setNewTrip(prev => ({ ...prev, startLocation: value, startCoords: null }));
      
      if (startSearchTimeout.current) {
        clearTimeout(startSearchTimeout.current);
      }
      
      startSearchTimeout.current = setTimeout(() => {
        searchLocation(value, true);
      }, 500);
    } else {
      setNewTrip(prev => ({ ...prev, destination: value, destinationCoords: null }));
      
      if (destSearchTimeout.current) {
        clearTimeout(destSearchTimeout.current);
      }
      
      destSearchTimeout.current = setTimeout(() => {
        searchLocation(value, false);
      }, 500);
    }
  };

  // Select location from suggestions
  const selectLocation = (suggestion, isStart = true) => {
    if (isStart) {
      setNewTrip(prev => ({
        ...prev,
        startLocation: suggestion.display_name,
        startCoords: {
          lat: suggestion.lat,
          lng: suggestion.lon
        }
      }));
      setShowStartSuggestions(false);
      setStartLocationSuggestions([]);
    } else {
      setNewTrip(prev => ({
        ...prev,
        destination: suggestion.display_name,
        destinationCoords: {
          lat: suggestion.lat,
          lng: suggestion.lon
        }
      }));
      setShowDestSuggestions(false);
      setDestinationSuggestions([]);
    }
  };

  // Login as a user
  const loginAs = (userId) => {
    const user = users.find(u => u.id === userId);
    setCurrentUser(user);
  };

  // Send friend request
  const sendFriendRequest = (toUserId) => {
    setUsers(users.map(user => {
      if (user.id === toUserId && !user.friendRequests.includes(currentUser.id)) {
        return { ...user, friendRequests: [...user.friendRequests, currentUser.id] };
      }
      return user;
    }));
  };

  // Accept friend request
  const acceptFriendRequest = (fromUserId) => {
    setUsers(users.map(user => {
      if (user.id === currentUser.id) {
        return {
          ...user,
          friends: [...user.friends, fromUserId],
          friendRequests: user.friendRequests.filter(id => id !== fromUserId)
        };
      }
      if (user.id === fromUserId) {
        return { ...user, friends: [...user.friends, currentUser.id] };
      }
      return user;
    }));
  };

  // Reject friend request
  const rejectFriendRequest = (fromUserId) => {
    setUsers(users.map(user => {
      if (user.id === currentUser.id) {
        return {
          ...user,
          friendRequests: user.friendRequests.filter(id => id !== fromUserId)
        };
      }
      return user;
    }));
  };

  // Create a new trip
  const createTrip = () => {
    if (newTrip.destination && newTrip.arrivalTime && newTrip.startLocation && newTrip.departureDate) {
      if (!newTrip.startCoords || !newTrip.destinationCoords) {
        alert('Please select locations from the dropdown suggestions');
        return;
      }
      
      const trip = {
        id: Date.now(),
        userId: currentUser.id,
        userName: currentUser.name,
        destination: newTrip.destination,
        destinationCoords: newTrip.destinationCoords,
        arrivalTime: newTrip.arrivalTime,
        departureDate: newTrip.departureDate,
        startLocation: newTrip.startLocation,
        startCoords: newTrip.startCoords,
        hasCarAvailable: newTrip.hasCarAvailable,
        createdAt: new Date().toISOString()
      };
      setTrips([...trips, trip]);
      setNewTrip({ 
        destination: '', 
        destinationCoords: null,
        arrivalTime: '', 
        departureDate: '',
        startLocation: '',
        startCoords: null,
        hasCarAvailable: false
      });
      setActiveTab('home');
    } else {
      alert('Please fill in all required fields');
    }
  };

  // AI-powered carpool matching with route optimization
  const generateRecommendations = async () => {
    const myTrips = trips.filter(t => t.userId === currentUser.id);
    if (myTrips.length === 0) {
      alert('Please create a trip first!');
      return;
    }

    const currentUserData = users.find(u => u.id === currentUser.id);
    const friendTrips = trips.filter(t => 
      t.userId !== currentUser.id && 
      currentUserData.friends.includes(t.userId)
    );

    if (friendTrips.length === 0) {
      alert('No trips from your friends found. Add more friends who have posted trips!');
      return;
    }

    setActiveTab('loading');

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 2000,
          messages: [
            {
              role: "user",
              content: `You are a carpooling route optimization AI. Analyze these trips and create optimal carpool matches with route planning.

My trips:
${myTrips.map(t => `- From ${t.startLocation} (${t.startCoords.lat}, ${t.startCoords.lng}) to ${t.destination} (${t.destinationCoords.lat}, ${t.destinationCoords.lng}), arriving by ${t.arrivalTime} on ${t.departureDate}. Car available: ${t.hasCarAvailable}`).join('\n')}

Friends' trips:
${friendTrips.map(t => `- ${t.userName}: From ${t.startLocation} (${t.startCoords.lat}, ${t.startCoords.lng}) to ${t.destination} (${t.destinationCoords.lat}, ${t.destinationCoords.lng}), arriving by ${t.arrivalTime} on ${t.departureDate}. Car available: ${t.hasCarAvailable} (Trip ID: ${t.id})`).join('\n')}

For each match, calculate:
1. If destinations are on the way (within reasonable detour - max 15% extra distance)
2. Time compatibility (same date, arrival times within 45 minutes)
3. Who should drive (based on hasCarAvailable and route efficiency)
4. Optimal route with pickup/dropoff waypoints

Respond ONLY with a JSON array of recommendations:
[
  {
    "tripId": <friend's trip ID>,
    "userName": "<friend's name>",
    "matchScore": <number 0-100>,
    "reason": "<brief explanation of why this is a good match>",
    "routeCompatibility": "<high/medium/low>",
    "suggestedDriver": "<your name/friend's name/either>",
    "estimatedDetour": "<e.g., '2.3 km extra' or 'direct route'>",
    "meetingPoint": "<suggested pickup location>",
    "routeDescription": "<brief description of the optimized route>"
  }
]

Return only the JSON array, no other text.`
            }
          ],
        })
      });

      const data = await response.json();
      const text = data.content.find(item => item.type === "text")?.text || "";
      const cleanText = text.replace(/```json|```/g, "").trim();
      const matches = JSON.parse(cleanText);
      
      const enrichedMatches = matches.map(match => {
        const trip = friendTrips.find(t => t.id === match.tripId);
        return { ...match, trip };
      }).filter(m => m.trip);

      setRecommendations(enrichedMatches);
      setActiveTab('recommendations');
    } catch (error) {
      console.error('AI matching error:', error);
      alert('Error generating recommendations. Please try again.');
      setActiveTab('myTrips');
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Car className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-3">EcoPool</h1>
            <p className="text-gray-600 mb-8">Smart carpooling to reduce fuel consumption</p>
            
            <div className="space-y-3">
              <p className="text-sm font-semibold text-gray-700 mb-4">Select a user to login:</p>
              {users.map(user => (
                <button
                  key={user.id}
                  onClick={() => loginAs(user.id)}
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  Login as {user.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentUserData = users.find(u => u.id === currentUser.id);
  const myTrips = trips.filter(t => t.userId === currentUser.id);
  const friendTrips = trips.filter(t => t.userId !== currentUser.id && currentUserData.friends.includes(t.userId));
  const nonFriends = users.filter(u => 
    u.id !== currentUser.id && 
    !currentUserData.friends.includes(u.id) &&
    !currentUserData.friendRequests.includes(u.id)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                <Car className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">EcoPool</h1>
                <p className="text-sm text-gray-600">Welcome, {currentUser.name}</p>
              </div>
            </div>
            <button
              onClick={() => setCurrentUser(null)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-2xl shadow-lg mb-6">
          <div className="flex border-b overflow-x-auto">
            <button
              onClick={() => setActiveTab('home')}
              className={`flex-1 py-4 px-6 font-semibold transition-colors flex items-center justify-center gap-2 ${
                activeTab === 'home' 
                  ? 'text-green-600 border-b-2 border-green-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Home className="w-4 h-4" />
              Home
            </button>
            <button
              onClick={() => setActiveTab('myTrips')}
              className={`flex-1 py-4 px-6 font-semibold transition-colors ${
                activeTab === 'myTrips' 
                  ? 'text-green-600 border-b-2 border-green-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              My Trips
            </button>
            <button
              onClick={() => setActiveTab('createTrip')}
              className={`flex-1 py-4 px-6 font-semibold transition-colors ${
                activeTab === 'createTrip' 
                  ? 'text-green-600 border-b-2 border-green-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Create Trip
            </button>
            <button
              onClick={() => setActiveTab('friends')}
              className={`flex-1 py-4 px-6 font-semibold transition-colors ${
                activeTab === 'friends' 
                  ? 'text-green-600 border-b-2 border-green-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Friends ({currentUserData.friends.length})
            </button>
            <button
              onClick={() => setActiveTab('addFriends')}
              className={`flex-1 py-4 px-6 font-semibold transition-colors relative ${
                activeTab === 'addFriends' 
                  ? 'text-green-600 border-b-2 border-green-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Add Friends
              {currentUserData.friendRequests.length > 0 && (
                <span className="absolute top-2 right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {currentUserData.friendRequests.length}
                </span>
              )}
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Home Page - All Announcements */}
            {activeTab === 'home' && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <Home className="w-6 h-6 text-green-500" />
                  <h2 className="text-2xl font-bold text-gray-800">Trip Announcements</h2>
                </div>
                
                <p className="text-gray-600 mb-6">See all the latest carpool trips from your network</p>

                {trips.length === 0 ? (
                  <div className="text-center py-16 text-gray-500">
                    <Car className="w-20 h-20 mx-auto mb-4 opacity-30" />
                    <p className="text-lg font-semibold mb-2">No trips announced yet</p>
                    <p className="text-sm">Be the first to create a trip and start carpooling!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {trips
                      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                      .map(trip => {
                        const tripUser = users.find(u => u.id === trip.userId);
                        const isMyTrip = trip.userId === currentUser.id;
                        const isFriend = currentUserData.friends.includes(trip.userId);
                        const canSendRequest = !isMyTrip && !isFriend && !currentUserData.friendRequests.includes(trip.userId);
                        
                        return (
                          <div 
                            key={trip.id} 
                            className={`rounded-xl p-6 border-2 transition-all shadow-md ${
                              isMyTrip 
                                ? 'bg-gradient-to-r from-green-50 to-blue-50 border-green-300' 
                                : isFriend
                                ? 'bg-white border-blue-200 hover:border-blue-400 hover:shadow-lg'
                                : 'bg-gray-50 border-gray-200'
                            }`}
                          >
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-lg ${
                                  isMyTrip ? 'bg-green-500' : isFriend ? 'bg-blue-500' : 'bg-gray-400'
                                }`}>
                                  {trip.userName.charAt(0)}
                                </div>
                                <div>
                                  <h3 className="font-bold text-gray-800 text-lg">
                                    {trip.userName}
                                    {isMyTrip && (
                                      <span className="ml-2 text-sm font-normal text-green-600">(You)</span>
                                    )}
                                  </h3>
                                  <p className="text-xs text-gray-500">
                                    Posted {new Date(trip.createdAt).toLocaleString([], { 
                                      month: 'short',
                                      day: 'numeric',
                                      hour: '2-digit', 
                                      minute: '2-digit' 
                                    })}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                {trip.hasCarAvailable && (
                                  <div className="flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full">
                                    <Key className="w-4 h-4" />
                                    <span className="text-xs font-semibold">Has Car</span>
                                  </div>
                                )}
                                
                                {canSendRequest && (
                                  <button
                                    onClick={() => sendFriendRequest(trip.userId)}
                                    className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium py-2 px-3 rounded-lg transition-colors"
                                  >
                                    <UserPlus className="w-4 h-4" />
                                    Add
                                  </button>
                                )}
                                
                                {isFriend && !isMyTrip && (
                                  <span className="flex items-center gap-1 text-sm font-medium text-blue-600">
                                    <Users className="w-4 h-4" />
                                    Friend
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            {/* Trip Details Card */}
                            <div className="bg-white bg-opacity-80 rounded-lg p-5 space-y-4 border border-gray-100">
                              {/* Date and Time Header */}
                              <div className="flex items-center gap-4 pb-3 border-b border-gray-200">
                                <div className="flex items-center gap-2 flex-1">
                                  <Calendar className="w-5 h-5 text-blue-600" />
                                  <div>
                                    <span className="text-xs font-semibold text-gray-500 uppercase block">Date</span>
                                    <span className="font-semibold text-gray-800">
                                      {new Date(trip.departureDate).toLocaleDateString('en-US', {
                                        weekday: 'short',
                                        month: 'short',
                                        day: 'numeric'
                                      })}
                                    </span>
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-2 flex-1">
                                  <Clock className="w-5 h-5 text-orange-500" />
                                  <div>
                                    <span className="text-xs font-semibold text-gray-500 uppercase block">Arrive by</span>
                                    <span className="font-semibold text-gray-800">{trip.arrivalTime}</span>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Route Information */}
                              <div className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-gray-600 mt-1 flex-shrink-0" />
                                <div className="flex-1">
                                  <span className="text-xs font-semibold text-gray-500 uppercase block mb-1">Starting from</span>
                                  <p className="font-semibold text-gray-800 text-sm">{trip.startLocation}</p>
                                </div>
                              </div>
                              
                              <div className="flex items-center justify-center py-2">
                                <div className="border-t-2 border-dashed border-gray-300 flex-1"></div>
                                <Navigation className="w-5 h-5 text-green-500 mx-3" />
                                <div className="border-t-2 border-dashed border-gray-300 flex-1"></div>
                              </div>
                              
                              <div className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                                <div className="flex-1">
                                  <span className="text-xs font-semibold text-gray-500 uppercase block mb-1">Going to</span>
                                  <p className="font-semibold text-gray-800 text-sm">{trip.destination}</p>
                                </div>
                              </div>
                            </div>
                            
                            {isFriend && !isMyTrip && (
                              <div className="mt-4 flex gap-2">
                                <button className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                                  <MessageCircle className="w-4 h-4" />
                                  Express Interest
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            )}

            {/* My Trips */}
            {activeTab === 'myTrips' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-800">Your Trips</h2>
                  <button
                    onClick={generateRecommendations}
                    className="flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                  >
                    <Sparkles className="w-4 h-4" />
                    Get AI Recommendations
                  </button>
                </div>
                
                {myTrips.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Navigation className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>No trips yet. Create your first trip!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {myTrips.map(trip => (
                      <div key={trip.id} className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-5 border-2 border-green-200">
                        <div className="flex items-start gap-4">
                          <div className="bg-green-500 rounded-full p-3">
                            <MapPin className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-blue-600" />
                                <span className="text-sm font-semibold text-gray-700">
                                  {new Date(trip.departureDate).toLocaleDateString('en-US', {
                                    weekday: 'short',
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-orange-500" />
                                <span className="text-sm font-semibold text-gray-700">{trip.arrivalTime}</span>
                              </div>
                              {trip.hasCarAvailable && (
                                <div className="flex items-center gap-1 bg-green-500 text-white px-2 py-1 rounded-full">
                                  <Key className="w-3 h-3" />
                                  <span className="text-xs font-semibold">Car Available</span>
                                </div>
                              )}
                            </div>
                            <div className="space-y-2">
                              <div>
                                <span className="text-xs font-medium text-gray-600">From:</span>
                                <p className="font-semibold text-gray-800">{trip.startLocation}</p>
                              </div>
                              <div>
                                <span className="text-xs font-medium text-gray-600">To:</span>
                                <p className="font-semibold text-gray-800">{trip.destination}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {friendTrips.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Friends' Trips</h3>
                    <div className="space-y-4">
                      {friendTrips.map(trip => (
                        <div key={trip.id} className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                          <div className="flex items-start gap-4">
                            <div className="bg-blue-500 rounded-full p-3">
                              <Users className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-gray-800 mb-2">{trip.userName}</p>
                              <div className="flex items-center gap-3 mb-3">
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4 text-blue-600" />
                                  <span className="text-sm text-gray-700">
                                    {new Date(trip.departureDate).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric'
                                    })}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="w-4 h-4 text-orange-500" />
                                  <span className="text-sm text-gray-700">{trip.arrivalTime}</span>
                                </div>
                                {trip.hasCarAvailable && (
                                  <div className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                    <Key className="w-3 h-3" />
                                    <span className="text-xs font-semibold">Has Car</span>
                                  </div>
                                )}
                              </div>
                              <div className="space-y-1 text-sm">
                                <div>
                                  <span className="text-gray-600">From:</span>
                                  <span className="font-medium text-gray-800 ml-1">{trip.startLocation}</span>
                                </div>
                                <div>
                                  <span className="text-gray-600">To:</span>
                                  <span className="font-medium text-gray-800 ml-1">{trip.destination}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Create Trip */}
            {activeTab === 'createTrip' && (
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-6">Create New Trip</h2>
                <div className="space-y-5">
                  {/* Start Location with Autocomplete */}
                  <div className="relative">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Starting Location *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={newTrip.startLocation}
                        onChange={(e) => handleLocationInput(e.target.value, true)}
                        onFocus={() => {
                          if (startLocationSuggestions.length > 0) {
                            setShowStartSuggestions(true);
                          }
                        }}
                        placeholder="Type to search for starting location..."
                        className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                      <Search className="absolute right-3 top-3.5 w-5 h-5 text-gray-400" />
                      {searchingStart && (
                        <div className="absolute right-10 top-3.5">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-500"></div>
                        </div>
                      )}
                    </div>
                    
                    {/* Start Location Suggestions Dropdown */}
                    {showStartSuggestions && startLocationSuggestions.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {startLocationSuggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            onClick={() => selectLocation(suggestion, true)}
                            className="w-full text-left px-4 py-3 hover:bg-green-50 border-b border-gray-100 last:border-b-0 transition-colors"
                          >
                            <div className="flex items-start gap-2">
                              <MapPin className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                              <div>
                                <p className="text-sm font-medium text-gray-800">{suggestion.display_name}</p>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                    
                    <p className="text-xs text-gray-500 mt-1">
                      {newTrip.startCoords ? '✓ Location selected' : 'Type at least 3 characters to search'}
                    </p>
                  </div>
                  
                  {/* Destination with Autocomplete */}
                  <div className="relative">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Destination *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={newTrip.destination}
                        onChange={(e) => handleLocationInput(e.target.value, false)}
                        onFocus={() => {
                          if (destinationSuggestions.length > 0) {
                            setShowDestSuggestions(true);
                          }
                        }}
                        placeholder="Type to search for destination..."
                        className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                      <Search className="absolute right-3 top-3.5 w-5 h-5 text-gray-400" />
                      {searchingDest && (
                        <div className="absolute right-10 top-3.5">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-500"></div>
                        </div>
                      )}
                    </div>
                    
                    {/* Destination Suggestions Dropdown */}
                    {showDestSuggestions && destinationSuggestions.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {destinationSuggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            onClick={() => selectLocation(suggestion, false)}
                            className="w-full text-left px-4 py-3 hover:bg-green-50 border-b border-gray-100 last:border-b-0 transition-colors"
                          >
                            <div className="flex items-start gap-2">
                              <MapPin className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                              <div>
                                <p className="text-sm font-medium text-gray-800">{suggestion.display_name}</p>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                    
                    <p className="text-xs text-gray-500 mt-1">
                      {newTrip.destinationCoords ? '✓ Location selected' : 'Type at least 3 characters to search'}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Departure Date *
                      </label>
                      <input
                        type="date"
                        value={newTrip.departureDate}
                        onChange={(e) => setNewTrip({ ...newTrip, departureDate: e.target.value })}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Arrival Time *
                      </label>
                      <input
                        type="time"
                        value={newTrip.arrivalTime}
                        onChange={(e) => setNewTrip({ ...newTrip, arrivalTime: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newTrip.hasCarAvailable}
                        onChange={(e) => setNewTrip({ ...newTrip, hasCarAvailable: e.target.checked })}
                        className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                      />
                      <div className="flex items-center gap-2">
                        <Key className="w-5 h-5 text-blue-600" />
                        <span className="font-semibold text-gray-800">I have a car available</span>
                      </div>
                    </label>
                    <p className="text-xs text-gray-600 mt-2 ml-8">
                      Check this if you can drive. This helps match you with passengers.
                    </p>
                  </div>
                  
                  <button
                    onClick={createTrip}
                    className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Car className="w-5 h-5" />
                    Create Trip Announcement
                  </button>
                  
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs text-gray-600">
                    <p className="font-semibold text-yellow-800 mb-1">📍 Using OpenStreetMap (Free)</p>
                    <p>Location data powered by OpenStreetMap Nominatim API - completely free to use!</p>
                  </div>
                </div>
              </div>
            )}

            {/* Friends List */}
            {activeTab === 'friends' && (
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-6">Your Friends</h2>
                {currentUserData.friends.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>No friends yet. Add some to start carpooling!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {currentUserData.friends.map(friendId => {
                      const friend = users.find(u => u.id === friendId);
                      return (
                        <div key={friendId} className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                          <span className="font-semibold text-gray-800">{friend.name}</span>
                          <span className="text-sm text-green-600 font-medium">Friends</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Add Friends */}
            {activeTab === 'addFriends' && (
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-6">Add Friends</h2>
                
                {/* Friend Requests */}
                {currentUserData.friendRequests.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Friend Requests</h3>
                    <div className="space-y-3">
                      {currentUserData.friendRequests.map(requestId => {
                        const requester = users.find(u => u.id === requestId);
                        return (
                          <div key={requestId} className="bg-blue-50 rounded-lg p-4 flex items-center justify-between border border-blue-200">
                            <span className="font-semibold text-gray-800">{requester.name}</span>
                            <div className="flex gap-2">
                              <button
                                onClick={() => acceptFriendRequest(requestId)}
                                className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-lg transition-colors"
                              >
                                <Check className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => rejectFriendRequest(requestId)}
                                className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-colors"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Available Users */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">People You May Know</h3>
                  {nonFriends.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">You're friends with everyone!</p>
                  ) : (
                    <div className="space-y-3">
                      {nonFriends.map(user => (
                        <div key={user.id} className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                          <span className="font-semibold text-gray-800">{user.name}</span>
                          <button
                            onClick={() => sendFriendRequest(user.id)}
                            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                          >
                            <UserPlus className="w-4 h-4" />
                            Add Friend
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* AI Recommendations */}
            {activeTab === 'recommendations' && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <Sparkles className="w-6 h-6 text-purple-500" />
                  <h2 className="text-xl font-bold text-gray-800">AI Carpool Recommendations</h2>
                </div>
                
                {recommendations.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <p>No compatible carpool matches found at this time.</p>
                    <p className="text-sm mt-2">Try adding more friends or creating trips with popular destinations.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recommendations.map((rec, index) => (
                      <div key={index} className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200 shadow-md">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-bold text-gray-800 text-lg mb-2">{rec.userName}</h3>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                rec.routeCompatibility === 'high' ? 'bg-green-100 text-green-700' :
                                rec.routeCompatibility === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-orange-100 text-orange-700'
                              }`}>
                                {rec.routeCompatibility.toUpperCase()} Match
                              </span>
                              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                                {rec.matchScore}% Compatible
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Route Information */}
                        {rec.trip && (
                          <div className="bg-white bg-opacity-70 rounded-lg p-4 mb-4 space-y-3">
                            <div className="flex items-center gap-2 text-sm">
                              <MapPin className="w-4 h-4 text-gray-600" />
                              <span className="font-medium text-gray-700">
                                {rec.trip.startLocation} → {rec.trip.destination}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Clock className="w-4 h-4" />
                              {new Date(rec.trip.departureDate).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric'
                              })} at {rec.trip.arrivalTime}
                            </div>
                            {rec.trip.hasCarAvailable && (
                              <div className="flex items-center gap-2 text-sm">
                                <Key className="w-4 h-4 text-green-600" />
                                <span className="font-medium text-green-700">Has car available</span>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {/* AI Analysis */}
                        <div className="space-y-3 mb-4">
                          <div className="bg-white bg-opacity-60 rounded-lg p-3">
                            <div className="flex items-start gap-2">
                              <Route className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-xs font-semibold text-gray-600 uppercase mb-1">Route Optimization</p>
                                <p className="text-sm text-gray-700 italic">"{rec.reason}"</p>
                              </div>
                            </div>
                          </div>
                          
                          {rec.estimatedDetour && (
                            <div className="grid grid-cols-2 gap-3">
                              <div className="bg-blue-50 rounded-lg p-3">
                                <p className="text-xs font-semibold text-blue-700 uppercase mb-1">Detour</p>
                                <p className="text-sm font-bold text-blue-900">{rec.estimatedDetour}</p>
                              </div>
                              {rec.suggestedDriver && (
                                <div className="bg-green-50 rounded-lg p-3">
                                  <p className="text-xs font-semibold text-green-700 uppercase mb-1">Suggested Driver</p>
                                  <p className="text-sm font-bold text-green-900">{rec.suggestedDriver}</p>
                                </div>
                              )}
                            </div>
                          )}
                          
                          {rec.meetingPoint && (
                            <div className="bg-orange-50 rounded-lg p-3">
                              <p className="text-xs font-semibold text-orange-700 uppercase mb-1">Meeting Point</p>
                              <p className="text-sm font-medium text-orange-900">{rec.meetingPoint}</p>
                            </div>
                          )}
                          
                          {rec.routeDescription && (
                            <div className="bg-gray-50 rounded-lg p-3">
                              <p className="text-xs font-semibold text-gray-700 uppercase mb-1">Route Plan</p>
                              <p className="text-sm text-gray-700">{rec.routeDescription}</p>
                            </div>
                          )}
                        </div>
                        
                        <button className="w-full bg-purple-500 hover:bg-purple-600 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                          <MessageCircle className="w-4 h-4" />
                          Contact {rec.userName}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                <button
                  onClick={() => setActiveTab('myTrips')}
                  className="mt-6 w-full bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  Back to My Trips
                </button>
              </div>
            )}

            {/* Loading */}
            {activeTab === 'loading' && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-500 mx-auto mb-4"></div>
                <p className="text-gray-600 font-semibold">AI is analyzing routes...</p>
                <p className="text-sm text-gray-500 mt-2">Finding your perfect carpool matches</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarpoolApp;
