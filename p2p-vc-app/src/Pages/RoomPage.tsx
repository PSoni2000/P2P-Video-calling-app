import React, { useEffect } from "react";
import { useParams } from "react-router-dom";

const RoomPage: React.FC = () => {
	const params = useParams();

	useEffect(() => {}, [params.name]);
	return <div>RoomPage : {params.userName}</div>;
};

export default RoomPage;
