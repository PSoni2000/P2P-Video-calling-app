import React, { useEffect, useRef, useState } from "react";
import Room from "../Components/Room";
import SideBar from "../Components/SideBar";

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
	};

	return (
		<div className="home-page">
			<SideBar />
			{joined ? (
				<Room
					name={name}
					localAudioTrack={localAudioTrack}
					localVideoTrack={localVideoTrack}
				/>
			) : (
				<div className="container">
					<div className="header">Landing Page Header</div>
					<div className="content">
						<div className="video-stream">
							<video autoPlay className="user-video" ref={videoRef} />
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
						</div>
						<div className="chat">Coming soon</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default LandingPage;
