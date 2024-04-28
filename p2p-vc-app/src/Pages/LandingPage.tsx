import React, { useEffect, useRef, useState } from "react";
import RoomPage from "./RoomPage";

const LandingPage: React.FC = () => {
	const [name, setName] = useState<string>("");
	const [localAudioTrack, setlocalAudioTrack] =
		useState<MediaStreamTrack | null>(null);
	const [localVideoTrack, setlocalVideoTrack] =
		useState<MediaStreamTrack | null>(null);
	const videoRef = useRef<HTMLVideoElement>(null);

	const [joined, setJoined] = useState(false);

	const getCam = async () => {
		const stream = await window.navigator.mediaDevices.getUserMedia({
			video: true,
			audio: true,
		});
		// mediaStream
		const audioTrack = stream.getAudioTracks()[0]; //TODO: Can build multiple device selection feature
		const videoTrack = stream.getVideoTracks()[0];
		setlocalAudioTrack(audioTrack);
		setlocalVideoTrack(videoTrack);
		if (!videoRef.current) return;

		videoRef.current.srcObject = new MediaStream([videoTrack]);
		videoRef.current.play();
		// MediaStream
	};
	useEffect(() => {
		if (videoRef && videoRef.current) {
			getCam();
		}
	}, [videoRef]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		setJoined(true);

		//TODO: join room logic
		console.log("join clicked", name);
	};

	if (!joined) {
		return (
			<>
				<form onSubmit={handleSubmit} className="user-details">
					<video autoPlay className="user-details__video" ref={videoRef} />
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
	}

	return (
		<RoomPage
			name={name}
			localAudioTrack={localAudioTrack}
			localVideoTrack={localVideoTrack}
		/>
	);
};

export default LandingPage;
