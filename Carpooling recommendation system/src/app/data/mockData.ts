export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Trip {
  id: string;
  userId: string;
  userName: string;
  destination: string;
  arrivalTime: string;
  date: string;
  userAvatar?: string;
}

export interface FriendRequest {
  id: string;
  fromUser: User;
  status: 'pending' | 'accepted' | 'rejected';
}

export interface CarpoolMatch {
  trip: Trip;
  matchScore: number;
  reason: string;
}

// Current logged-in user
export const currentUser: User = {
  id: "user-1",
  name: "You",
  email: "you@example.com",
};

// Mock users for friend requests
export const mockUsers: User[] = [
  { id: "user-2", name: "Sarah Johnson", email: "sarah@example.com" },
  { id: "user-3", name: "Mike Chen", email: "mike@example.com" },
  { id: "user-4", name: "Emily Davis", email: "emily@example.com" },
  { id: "user-5", name: "James Wilson", email: "james@example.com" },
  { id: "user-6", name: "Lisa Anderson", email: "lisa@example.com" },
  { id: "user-7", name: "David Brown", email: "david@example.com" },
  { id: "user-8", name: "Rachel Kim", email: "rachel@example.com" },
  { id: "user-9", name: "Tom Martinez", email: "tom@example.com" },
];

// Mock trips
export const mockTrips: Trip[] = [
  {
    id: "trip-1",
    userId: "user-2",
    userName: "Sarah Johnson",
    destination: "Downtown Office Plaza, 123 Main St",
    arrivalTime: "09:00",
    date: "2026-02-07",
  },
  {
    id: "trip-2",
    userId: "user-3",
    userName: "Mike Chen",
    destination: "Tech Park, 456 Innovation Drive",
    arrivalTime: "08:30",
    date: "2026-02-07",
  },
  {
    id: "trip-3",
    userId: "user-4",
    userName: "Emily Davis",
    destination: "City Center Mall, 789 Commerce Blvd",
    arrivalTime: "10:00",
    date: "2026-02-07",
  },
  {
    id: "trip-4",
    userId: "user-5",
    userName: "James Wilson",
    destination: "University Campus, 321 College Ave",
    arrivalTime: "08:00",
    date: "2026-02-07",
  },
  {
    id: "trip-5",
    userId: "user-6",
    userName: "Lisa Anderson",
    destination: "Medical Center, 555 Health Way",
    arrivalTime: "07:30",
    date: "2026-02-07",
  },
  {
    id: "trip-6",
    userId: "user-7",
    userName: "David Brown",
    destination: "Airport Terminal 2, 999 Flight Rd",
    arrivalTime: "11:00",
    date: "2026-02-07",
  },
];
