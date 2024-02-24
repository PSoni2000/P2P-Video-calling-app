import { createBrowserRouter, RouterProvider } from "react-router-dom";
import LandingPage from "./Pages/LandingPage";
import RoomPage from "./Pages/RoomPage";
import "./App.css";

const App: React.FC = () => {
	const router = createBrowserRouter([
		{ path: "/", element: <LandingPage /> },
		{ path: "/room/:userName", element: <RoomPage /> },
	]);
	return <RouterProvider router={router} />;
};

export default App;
