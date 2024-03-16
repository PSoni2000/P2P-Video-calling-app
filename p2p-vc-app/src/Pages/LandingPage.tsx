import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const LandingPage: React.FC = () => {
	const [name, setName] = useState<string>("");
	const [joined, setJoined] = useState(false);
	const navigate = useNavigate();

	useEffect(() => {}, []);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		navigate(`/room/${name}`);

		//TODO: join room logic
		console.log("join clicked", name);
	};
	return (
		<>
			<form onSubmit={handleSubmit} className="user-details">
				<div className="user-details__name">
					<label htmlFor="Name">Name</label>
					<input
						type="text"
						id="Name"
						value={name}
						required
						onChange={(e) => {
							setName(e.target.value);
						}}
					/>
				</div>
				<button type="submit">Join</button>
			</form>
		</>
	);
};

export default LandingPage;
