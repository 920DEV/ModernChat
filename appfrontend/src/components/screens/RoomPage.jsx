import React, { useEffect, useCallback, useState } from "react";
import ReactPlayer from "react-player";
import peer from "../service/peer";
import { useSocket } from "../../Context/ChatProvider";

const RoomPage = () => {
  const socket1 = useSocket();
  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [myStream, setMyStream] = useState();
  // const [remoteStream, setRemoteStream] = useState();

  const handleUserJoined = useCallback(({ email, id }) => {
    console.log(`Email ${email} joined room`);
    setRemoteSocketId(id);
  }, []);
  const handleCallUser = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    const offer = await peer.getOffer();
    socket1.emit("user:call", { to: remoteSocketId, offer });
    setMyStream(stream);
  }, [remoteSocketId, socket1]);

  const handleIncommingCall = useCallback(
    async ({ from, offer }) => {
      setRemoteSocketId(from);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      setMyStream(stream);
      console.log(`Incoming Call`, from, offer);
      const ans = await peer.getAnswer(offer);
      socket1.emit("call:accepted", { to: from, ans });
    },
    [socket1]
  );

  const sendStreams = useCallback(() => {
    for (const track of myStream.getTracks()) {
      peer.peer.addTrack(track, myStream);
    }
  }, [myStream]);

  const handleCallAccepted = useCallback(
    ({ from, ans }) => {
      peer.setLocalDescription(ans);
      console.log("Call Accepted!");
      sendStreams();
    },
    [sendStreams]
  );
  const handleNegoNeeded = useCallback(async () => {
    const offer = await peer.getOffer();
    socket1.emit("peer:nego:needed", { offer, to: remoteSocketId });
  }, [remoteSocketId, socket1]);

  useEffect(() => {
    peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);
    return () => {
      peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
    };
  }, [handleNegoNeeded]);

  const handleNegoNeedIncomming = useCallback(
    async ({ from, offer }) => {
      const ans = await peer.getAnswer(offer);
      socket1.emit("peer:nego:done", { to: from, ans });
    },
    [socket1]
  );

  const handleNegoNeedFinal = useCallback(async ({ ans }) => {
    await peer.setLocalDescription(ans);
  }, []);


  // remote stream
  // useEffect(() => {
  //   peer.peer.addEventListener("track", async (ev) => {
  //     const remoteStream = ev.streams;
  //     console.log("GOT TRACKS!!");
  //     setRemoteStream(remoteStream[0]);
  //   });
  // }, []);

  useEffect(() => {
    socket1.on("user:joined", handleUserJoined);
    socket1.on("incomming:call", handleIncommingCall);
    socket1.on("call:accepted", handleCallAccepted);
    socket1.on("peer:nego:needed", handleNegoNeedIncomming);
    socket1.on("peer:nego:final", handleNegoNeedFinal);

    return () => {
      socket1.off("user:joined", handleUserJoined);
      socket1.off("incomming:call", handleIncommingCall);
      socket1.off("call:accepted", handleCallAccepted);
      socket1.off("peer:nego:needed", handleNegoNeedIncomming);
      socket1.off("peer:nego:final", handleNegoNeedFinal);
    };
  }, [
    socket1,
    handleUserJoined,
    handleIncommingCall,
    handleCallAccepted,
    handleNegoNeedIncomming,
    handleNegoNeedFinal,
  ]);

  return (
    <div>
      <h1>Room Page</h1>
      <h4>{remoteSocketId ? "Connected" : "No one in room"}</h4>
      {/* {myStream && <button onClick={sendStreams}>Send Stream</button>} */}
      {remoteSocketId && <button onClick={handleCallUser}>CALL</button>}
      {myStream && (
        <>
          <h1>My Stream</h1>
          <ReactPlayer
            playing
            // muted
            height="500px"
            width="500px"
            url={myStream}
          />
        </>
      )}
      {/* {remoteStream && (
        <>
          <h1>Remote Stream</h1>
          <ReactPlayer
            playing
            // muted
            height="500px"
            width="600px"
            url={remoteStream}
          />
        </>
      )} */}
    </div>
  );
};

export default RoomPage;