import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Middleware
app.use("*", cors());
app.use("*", logger(console.log));

// Create Supabase client
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

// ===== AUTH ROUTES =====

// Sign up
app.post("/make-server-c50e2f7e/signup", async (c) => {
  try {
    const { email, password, name } = await c.req.json();
    
    if (!email || !password || !name) {
      return c.json({ error: "Missing required fields" }, 400);
    }
    
    // Create user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true,
    });
    
    if (authError) {
      console.log("Authorization error during sign up:", authError);
      return c.json({ error: authError.message }, 400);
    }
    
    // Store user profile in KV store
    await kv.set(`user:${authData.user.id}`, {
      id: authData.user.id,
      email,
      name,
      createdAt: new Date().toISOString(),
    });
    
    return c.json({ user: authData.user });
  } catch (error) {
    console.log("Error during sign up:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// ===== FRIEND ROUTES =====

// Get all users (for finding friends)
app.get("/make-server-c50e2f7e/users", async (c) => {
  try {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user || authError) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    
    // Get all user profiles
    const users = await kv.getByPrefix("user:");
    
    // Filter out current user
    const filteredUsers = users.filter((u: any) => u.id !== user.id);
    
    return c.json({ users: filteredUsers });
  } catch (error) {
    console.log("Error fetching users:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Send friend request
app.post("/make-server-c50e2f7e/friend-request", async (c) => {
  try {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user || authError) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    
    const { toUserId } = await c.req.json();
    
    if (!toUserId) {
      return c.json({ error: "Missing toUserId" }, 400);
    }
    
    const requestId = `friend-req:${user.id}:${toUserId}`;
    
    // Check if request already exists
    const existing = await kv.get(requestId);
    if (existing) {
      return c.json({ error: "Friend request already sent" }, 400);
    }
    
    const fromUserData = await kv.get(`user:${user.id}`);
    
    await kv.set(requestId, {
      id: requestId,
      fromUserId: user.id,
      toUserId,
      fromUser: fromUserData,
      status: "pending",
      createdAt: new Date().toISOString(),
    });
    
    return c.json({ success: true });
  } catch (error) {
    console.log("Error sending friend request:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Get pending friend requests
app.get("/make-server-c50e2f7e/friend-requests", async (c) => {
  try {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user || authError) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    
    // Get all friend requests
    const allRequests = await kv.getByPrefix("friend-req:");
    
    // Filter requests where current user is the recipient
    const pendingRequests = allRequests.filter(
      (req: any) => req.toUserId === user.id && req.status === "pending"
    );
    
    return c.json({ requests: pendingRequests });
  } catch (error) {
    console.log("Error fetching friend requests:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Accept/Reject friend request
app.post("/make-server-c50e2f7e/friend-request/:action", async (c) => {
  try {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user || authError) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    
    const action = c.req.param("action"); // 'accept' or 'reject'
    const { requestId } = await c.req.json();
    
    const request = await kv.get(requestId);
    
    if (!request || request.toUserId !== user.id) {
      return c.json({ error: "Invalid request" }, 400);
    }
    
    if (action === "accept") {
      // Create friendship both ways
      await kv.set(`friendship:${request.fromUserId}:${user.id}`, {
        userId: request.fromUserId,
        friendId: user.id,
        createdAt: new Date().toISOString(),
      });
      
      await kv.set(`friendship:${user.id}:${request.fromUserId}`, {
        userId: user.id,
        friendId: request.fromUserId,
        createdAt: new Date().toISOString(),
      });
    }
    
    // Delete the request
    await kv.del(requestId);
    
    return c.json({ success: true });
  } catch (error) {
    console.log("Error processing friend request:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Get friends list
app.get("/make-server-c50e2f7e/friends", async (c) => {
  try {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user || authError) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    
    // Get all friendships
    const allFriendships = await kv.getByPrefix(`friendship:${user.id}:`);
    
    // Get friend user data
    const friendIds = allFriendships.map((f: any) => f.friendId);
    const friends = await Promise.all(
      friendIds.map((id: string) => kv.get(`user:${id}`))
    );
    
    return c.json({ friends: friends.filter(Boolean) });
  } catch (error) {
    console.log("Error fetching friends:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Remove friend
app.delete("/make-server-c50e2f7e/friend/:friendId", async (c) => {
  try {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user || authError) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    
    const friendId = c.req.param("friendId");
    
    // Delete both directions of friendship
    await kv.del(`friendship:${user.id}:${friendId}`);
    await kv.del(`friendship:${friendId}:${user.id}`);
    
    return c.json({ success: true });
  } catch (error) {
    console.log("Error removing friend:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// ===== TRIP ROUTES =====

// Create trip
app.post("/make-server-c50e2f7e/trips", async (c) => {
  try {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user || authError) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    
    const { destination, arrivalTime, date } = await c.req.json();
    
    if (!destination || !arrivalTime || !date) {
      return c.json({ error: "Missing required fields" }, 400);
    }
    
    const userData = await kv.get(`user:${user.id}`);
    const tripId = `trip:${user.id}:${Date.now()}`;
    
    const trip = {
      id: tripId,
      userId: user.id,
      userName: userData.name,
      destination,
      arrivalTime,
      date,
      createdAt: new Date().toISOString(),
    };
    
    await kv.set(tripId, trip);
    
    return c.json({ trip });
  } catch (error) {
    console.log("Error creating trip:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Get user's trips
app.get("/make-server-c50e2f7e/trips", async (c) => {
  try {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user || authError) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    
    const trips = await kv.getByPrefix(`trip:${user.id}:`);
    
    return c.json({ trips });
  } catch (error) {
    console.log("Error fetching trips:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Get all trips (for matching)
app.get("/make-server-c50e2f7e/all-trips", async (c) => {
  try {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user || authError) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    
    // Get all trips
    const allTrips = await kv.getByPrefix("trip:");
    
    // Filter out user's own trips
    const otherTrips = allTrips.filter((trip: any) => trip.userId !== user.id);
    
    return c.json({ trips: otherTrips });
  } catch (error) {
    console.log("Error fetching all trips:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Delete trip
app.delete("/make-server-c50e2f7e/trips/:tripId", async (c) => {
  try {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user || authError) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    
    const tripId = c.req.param("tripId");
    const trip = await kv.get(tripId);
    
    if (!trip || trip.userId !== user.id) {
      return c.json({ error: "Unauthorized to delete this trip" }, 403);
    }
    
    await kv.del(tripId);
    
    return c.json({ success: true });
  } catch (error) {
    console.log("Error deleting trip:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Get current user profile
app.get("/make-server-c50e2f7e/me", async (c) => {
  try {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user || authError) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    
    const userData = await kv.get(`user:${user.id}`);
    
    return c.json({ user: userData });
  } catch (error) {
    console.log("Error fetching user profile:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

Deno.serve(app.fetch);
