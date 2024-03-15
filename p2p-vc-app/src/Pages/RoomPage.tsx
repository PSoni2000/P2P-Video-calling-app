import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Socket, io } from "socket.io-client";

const URL: string = "http://localhost:3000";
const RoomPage: React.FC = () => {
	const params = useParams();
	const [lobby, setLobby] = useState<boolean>(true);
	const [socket, setSocket] = useState<null | Socket>(null);

	useEffect(() => {
		const socket = io(URL);
		socket.on("send-offer", ({ roomId }) => {
			setLobby(false);
			socket.emit("offer", { sdp: "", roomId });
		});
		socket.on("offer", ({ offer, roomId }) => {
			setLobby(false);
			socket.emit("answer", { sdp: "", roomId });
		});
		socket.on("answer", ({ roomId, offer }) => {
			setLobby(false);
		});
		socket.on("lobby", () => {
			setLobby(true);
		});

		setSocket(socket);
	}, [params.name]);

	if (lobby) {
		return <div>Waiting to connect you with someone...</div>;
	}
	return (
		<div>
			Hi : {params.userName}
			<video width={400} height={400} />
			<video width={400} height={400} />
		</div>
	);
};

export default RoomPage;
