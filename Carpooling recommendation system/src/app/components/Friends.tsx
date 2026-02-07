import { useState, useEffect } from "react";
import { User, FriendRequest } from "../data/mockData";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { UserPlus, UserCheck, X, Search, Users } from "lucide-react";
import { toast } from "sonner";
import { projectId } from "../../../utils/supabase/info";

export function Friends() {
  const [friends, setFriends] = useState<User[]>([]);
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  
  const accessToken = document.querySelector("[data-access-token]")?.getAttribute("data-access-token");
  const currentUserId = document.querySelector("[data-current-user-id]")?.getAttribute("data-current-user-id");
  
  useEffect(() => {
    fetchData();
  }, []);
  
  const fetchData = async () => {
    try {
      // Fetch friends
      const friendsResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-c50e2f7e/friends`,
        {
          headers: {
            "Authorization": `Bearer ${accessToken}`,
          },
        }
      );
      
      const friendsData = await friendsResponse.json();
      if (friendsResponse.ok) {
        setFriends(friendsData.friends || []);
      }
      
      // Fetch pending requests
      const requestsResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-c50e2f7e/friend-requests`,
        {
          headers: {
            "Authorization": `Bearer ${accessToken}`,
          },
        }
      );
      
      const requestsData = await requestsResponse.json();
      if (requestsResponse.ok) {
        setPendingRequests(requestsData.requests || []);
      }
      
      // Fetch all users
      const usersResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-c50e2f7e/users`,
        {
          headers: {
            "Authorization": `Bearer ${accessToken}`,
          },
        }
      );
      
      const usersData = await usersResponse.json();
      if (usersResponse.ok) {
        setAvailableUsers(usersData.users || []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load friends data");
    } finally {
      setLoading(false);
    }
  };
  
  const handleSendRequest = async (user: User) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-c50e2f7e/friend-request`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ toUserId: user.id }),
        }
      );
      
      if (response.ok) {
        toast.success(`Friend request sent to ${user.name}`);
        // Note: In a real app, you might want to track sent requests
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to send request");
      }
    } catch (error) {
      console.error("Error sending friend request:", error);
      toast.error("Failed to send friend request");
    }
  };
  
  const handleAcceptRequest = async (request: FriendRequest) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-c50e2f7e/friend-request/accept`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ requestId: request.id }),
        }
      );
      
      if (response.ok) {
        toast.success(`You are now friends with ${request.fromUser.name}`);
        // Refresh data
        fetchData();
      } else {
        toast.error("Failed to accept request");
      }
    } catch (error) {
      console.error("Error accepting request:", error);
      toast.error("Failed to accept request");
    }
  };
  
  const handleRejectRequest = async (request: FriendRequest) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-c50e2f7e/friend-request/reject`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ requestId: request.id }),
        }
      );
      
      if (response.ok) {
        toast.info("Friend request declined");
        fetchData();
      } else {
        toast.error("Failed to reject request");
      }
    } catch (error) {
      console.error("Error rejecting request:", error);
      toast.error("Failed to reject request");
    }
  };
  
  const handleRemoveFriend = async (friendId: string) => {
    const friend = friends.find(f => f.id === friendId);
    
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-c50e2f7e/friend/${friendId}`,
        {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
          },
        }
      );
      
      if (response.ok) {
        toast.info(`Removed ${friend?.name} from friends`);
        setFriends(friends.filter(f => f.id !== friendId));
      } else {
        toast.error("Failed to remove friend");
      }
    } catch (error) {
      console.error("Error removing friend:", error);
      toast.error("Failed to remove friend");
    }
  };
  
  const isFriend = (userId: string) => friends.some(f => f.id === userId);
  
  const filteredUsers = availableUsers.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  if (loading) {
    return (
      <div className="pb-24 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading friends...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="pb-24">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Friends</h2>
        <p className="text-gray-600">
          Connect with friends to find carpool opportunities
        </p>
      </div>
      
      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">Pending Requests</h3>
          <div className="space-y-3">
            {pendingRequests.map((request) => (
              <Card key={request.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                      {request.fromUser.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold">{request.fromUser.name}</p>
                      <p className="text-sm text-gray-500">{request.fromUser.email}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleAcceptRequest(request)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <UserCheck className="w-4 h-4 mr-1" />
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRejectRequest(request)}
                    >
                      <X className="w-4 h-4 mr-1" />
                      Decline
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
      
      {/* Your Friends */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">
          Your Friends ({friends.length})
        </h3>
        
        {friends.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <h4 className="text-xl font-semibold mb-2">No friends yet</h4>
              <p className="text-gray-600">
                Add friends to start finding carpool matches
              </p>
            </div>
          </Card>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {friends.map((friend) => (
              <Card key={friend.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-400 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                      {friend.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold">{friend.name}</p>
                      <p className="text-sm text-gray-500">{friend.email}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRemoveFriend(friend.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    Remove
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      {/* Find Friends */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Find Friends</h3>
        
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        {filteredUsers.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-gray-600">No users found</p>
          </Card>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {filteredUsers.map((user) => {
              const isAlreadyFriend = isFriend(user.id);
              
              return (
                <Card key={user.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-pink-400 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    
                    {isAlreadyFriend ? (
                      <Badge className="bg-green-100 text-green-700">Friends</Badge>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleSendRequest(user)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <UserPlus className="w-4 h-4 mr-1" />
                        Add
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
