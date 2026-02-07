import { createBrowserRouter } from "react-router";
import { Root } from "./components/Root";
import { Home } from "./components/Home";
import { Friends } from "./components/Friends";
import { CreateTrip } from "./components/CreateTrip";
import { Recommendations } from "./components/Recommendations";
import { Profile } from "./components/Profile";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: "friends", Component: Friends },
      { path: "create-trip", Component: CreateTrip },
      { path: "recommendations", Component: Recommendations },
      { path: "profile", Component: Profile },
    ],
  },
]);
