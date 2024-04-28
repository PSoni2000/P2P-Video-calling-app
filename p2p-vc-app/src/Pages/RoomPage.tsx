import React, { useEffect, useRef, useState } from "react";
import { Socket, io } from "socket.io-client";

const URL: string = "http://localhost:3000";

const RoomPage: React.FC<{
	name: string;
	localVideoTrack: MediaStreamTrack | null;
	localAudioTrack: MediaStreamTrack | null;
}> = ({ name, localVideoTrack, localAudioTrack }) => {
	const [lobby, setLobby] = useState<boolean>(true);
	const [socket, setSocket] = useState<null | Socket>(null);
	const [sendingPc, setSendingPc] = useState<null | RTCPeerConnection>(null);
	const [receivingPc, setReceivingPc] = useState<null | RTCPeerConnection>(
		null
	);
	const [remoteVideoTrack, setRemoteVideoTrack] =
		useState<MediaStreamTrack | null>(null);
	const [remoteAudioTrack, setRemoteAudioTrack] =
		useState<MediaStreamTrack | null>(null);
	const [remoteMediaStream, setRemoteMediaStream] =
		useState<MediaStream | null>(null);
	const remoteVideoRef = useRef<HTMLVideoElement>();
	const localVideoRef = useRef<HTMLVideoElement>();

	useEffect(() => {
		const socket = io(URL);
		socket.on("send-offer", async ({ roomId }) => {
			setLobby(false);
			const pc = new RTCPeerConnection();

			setSendingPc(pc);
			if (localVideoTrack) {
				pc.addTrack(localVideoTrack);
			}
			if (localAudioTrack) {
				pc.addTrack(localAudioTrack);
			}

			pc.onicecandidate = async (e) => {
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
				// on negotiation neeeded, sending offer
				const sdp = await pc.createOffer();
				pc.setLocalDescription(sdp);
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

			setRemoteMediaStream(stream);
			// trickle ice
			setReceivingPc(pc);
			//FIXME: window.pcr = pc;
			pc.ontrack = (e) => {
				const { track, type } = e;
				if (type == "audio") {
					setRemoteAudioTrack(track);
					// @ts-ignore
					remoteVideoRef.current.srcObject.addTrack(track);
				} else {
					setRemoteVideoTrack(track);
					// @ts-ignore
					remoteVideoRef.current.srcObject.addTrack(track);
				}
				//@ts-ignore
				remoteVideoRef.current.play();
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

			await pc.setRemoteDescription(remoteSdp);
			const sdp = await pc.createAnswer();

			await pc.setLocalDescription(sdp);

			socket.emit("answer", {
				roomId,
				sdp: sdp,
			});
		});

		socket.on("answer", ({ roomId, sdp: remoteSdp }) => {
			setLobby(false);
			setSendingPc((pc) => {
				pc?.setRemoteDescription(remoteSdp);
				return pc;
			});
		});

		socket.on("lobby", () => {
			setLobby(true);
		});

		socket.on("add-ice-candidate", ({ candidate, type }) => {
			if (type == "sender") {
				setReceivingPc((pc) => {
					pc?.addIceCandidate(candidate);
					return pc;
				});
			} else {
				setSendingPc((pc) => {
					pc?.addIceCandidate(candidate);
					return pc;
				});
			}
		});

		setSocket(socket);
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
