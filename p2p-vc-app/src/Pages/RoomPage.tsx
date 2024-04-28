import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const URL: string = "http://localhost:3000";
declare global {
	interface Window {
		pcr: RTCPeerConnection;
	}
}
const RoomPage: React.FC<{
	name: string;
	localVideoTrack: MediaStreamTrack | null;
	localAudioTrack: MediaStreamTrack | null;
}> = ({ name, localVideoTrack, localAudioTrack }) => {
	const [lobby, setLobby] = useState<boolean>(true);
	const sendingPcRef = useRef<null | RTCPeerConnection>(null);
	const receivingPcRef = useRef<null | RTCPeerConnection>(null);
	const remoteVideoRef = useRef<HTMLVideoElement>(null);
	const localVideoRef = useRef<HTMLVideoElement>(null);

	useEffect(() => {
		try {
			const socket = io(URL);
			// Handle connection errors
			socket.on("connect_error", (error: Error) => {
				console.error(`Socket connection error: ${error.message}`);
			});

			// Handle connection timeout
			socket.on("connect_timeout", () => {
				console.error("Socket connection timeout");
			});

			// Handle reconnection errors
			socket.on("reconnect_error", (error: Error) => {
				console.error(`Socket reconnection error: ${error.message}`);
			});

			// Handle reconnection failure
			socket.on("reconnect_failed", () => {
				console.error("Socket reconnection failed");
			});

			socket.on("send-offer", async ({ roomId }) => {
				// sending offer
				setLobby(false);
				const pc = new RTCPeerConnection();
				sendingPcRef.current = pc;
				if (localVideoTrack) {
					// added tack
					pc.addTrack(localVideoTrack);
				}
				if (localAudioTrack) {
					// added tack
					pc.addTrack(localAudioTrack);
				}

				pc.onicecandidate = async (e: RTCPeerConnectionIceEvent) => {
					// receiving ice candidate locally
					if (e.candidate) {
						socket.emit("add-ice-candidate", {
							candidate: e.candidate,
							type: "sender",
							roomId,
						});
					}
				};

				pc.onnegotiationneeded = async () => {
					// on negotiation needed, sending offer
					const sdp = await pc.createOffer();
					pc.setLocalDescription(new RTCSessionDescription(sdp));
					socket.emit("offer", {
						sdp,
						roomId,
					});
				};
			});

			socket.on("offer", async ({ roomId, sdp: remoteSdp }) => {
				// received offer
				setLobby(false);
				const pc = new RTCPeerConnection();

				const stream = new MediaStream();
				if (remoteVideoRef.current) {
					remoteVideoRef.current.srcObject = stream;
				}
				// trickle ice
				receivingPcRef.current = pc;
				window.pcr = pc;

				pc.ontrack = (e: RTCTrackEvent) => {
					const { track, type } = e;
					if (type == "audio") {
						if (remoteVideoRef.current && remoteVideoRef.current.srcObject)
							// @ts-ignore
							remoteVideoRef.current.srcObject.addTrack(track);
					} else {
						if (remoteVideoRef.current && remoteVideoRef.current.srcObject)
							// @ts-ignore
							remoteVideoRef.current.srcObject.addTrack(track);
					}

					remoteVideoRef?.current?.play();
				};

				pc.onicecandidate = async (e) => {
					if (!e.candidate) return;
					// ice candidate on receiving side
					if (e.candidate) {
						socket.emit("add-ice-candidate", {
							candidate: e.candidate,
							type: "receiver",
							roomId,
						});
					}
				};

				await pc.setRemoteDescription(new RTCSessionDescription(remoteSdp));
				const sdp = await pc.createAnswer();

				await pc.setLocalDescription(sdp);

				socket.emit("answer", {
					roomId,
					sdp: sdp,
				});
			});

			socket.on("answer", ({ sdp: remoteSdp }) => {
				setLobby(false);
				sendingPcRef.current?.setRemoteDescription(
					new RTCSessionDescription(remoteSdp)
				);
			});

			socket.on("lobby", () => {
				setLobby(true);
			});

			socket.on(
				"add-ice-candidate",
				({ candidate, type }: { candidate: RTCIceCandidate; type: string }) => {
					// add ice candidate from remote
					if (type == "sender") {
						if (!receivingPcRef.current) {
							console.error("receiving pc not found");
						}
						receivingPcRef.current?.addIceCandidate(candidate);
					} else {
						if (!sendingPcRef.current) {
							console.error("sending pc not found");
						}
						sendingPcRef.current?.addIceCandidate(candidate);
					}
				}
			);
		} catch (error) {
			console.error(`Error:${JSON.stringify(error)}`);
		}
	}, [name]);

	useEffect(() => {
		if (localVideoRef.current) {
			if (localVideoTrack) {
				localVideoRef.current.srcObject = new MediaStream([localVideoTrack]);
				localVideoRef.current.play();
			}
		}
	}, [localVideoRef]);

	return (
		<div>
			Hi {name}
			<video autoPlay width={400} height={400} ref={localVideoRef} />
			{lobby ? "Waiting to connect you to someone" : null}
			<video autoPlay width={400} height={400} ref={remoteVideoRef} />
		</div>
	);
};

export default RoomPage;
