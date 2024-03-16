import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Socket, io } from "socket.io-client";

const URL: string = "http://localhost:3000";

const RoomPage: React.FC = () => {
	const params = useParams();
	const [lobby, setLobby] = useState<boolean>(true);
	const [socket, setSocket] = useState<null | Socket>(null);
	const [sendingPc, setSendingPc] = useState<null | RTCPeerConnection>(null);
	const [receivingPc, setReceivingPc] = useState<null | RTCPeerConnection>(
		null
	);
	const [remoteVideoTrack, setRemoteVideoTrack] =
		useState<MediaStreamTrack | null>(null);
	const [localVideoTracck, setlocalVideoTracck] =
		useState<MediaStreamTrack | null>(null);
	const [remoteAudioTrack, setRemoteAudioTrack] =
		useState<MediaStreamTrack | null>(null);
	const [localAudioTrack, setLocalAudioTrack] =
		useState<MediaStreamTrack | null>(null);

	useEffect(() => {
		const socket = io(URL);
		socket.on("send-offer", async ({ roomId }) => {
			setLobby(false);
			const pc = new RTCPeerConnection();
			setSendingPc(pc);

			const sdp = await pc.createOffer();
			socket.emit("offer", { sdp, roomId });
		});
		socket.on("offer", async ({ offer, roomId }) => {
			setLobby(false);
			const pc = new RTCPeerConnection();

			const sdp = await pc.createAnswer();

			// trickle ice
			setReceivingPc(pc);
			pc.ontrack = ({ track, type }) => {
				if (type == "audio") {
					setRemoteAudioTrack(track);
				} else {
					setRemoteVideoTrack(track);
				}
			};
			socket.emit("answer", { sdp, roomId });
		});
		socket.on("answer", ({ roomId, answer }) => {
			setLobby(false);
			setSendingPc((pc) => {
				pc?.setRemoteDescription({
					type: "answer",
					sdp: answer,
				});
				return pc;
			});
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
