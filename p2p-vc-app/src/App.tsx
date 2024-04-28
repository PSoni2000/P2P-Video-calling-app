import { createBrowserRouter, RouterProvider } from "react-router-dom";
import LandingPage from "./Pages/LandingPage";
import "./App.css";

const App: React.FC = () => {
	const router = createBrowserRouter([{ path: "/", element: <LandingPage /> }]);
	return <RouterProvider router={router} />;
};

export default App;
