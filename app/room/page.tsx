"use client";

import Image from "next/image";
import React, { useReducer } from "react";
import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useRouter } from "next/navigation";
import Game from "@/components/Multiplayer/Game";


const Enter = () => {
  const router = useRouter();
  const [socket, setSocket] = useState<Socket | null>(null);

  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const [showCard, setShowCard] = useState(false);
  const [error, setError] = useState("");
  const [roomFull, setRoomFull] = useState(false);
  const [userExistedInRoom , setUserExistedInRoom] = useState(false);
  const joinRoom = (e: any) => {
    if (username !== "" && room !== "") {
      
      setShowCard(true);
      if (e.keyCode === 13) {
        setShowCard(true);
      }
    
    }
  };

  const handleGoBack = () => {
    setShowCard(false);
    setUsername("");
    setRoom("");
    setRoomFull(false)
    setUserExistedInRoom(false)
  };

  useEffect(() => {
    const newSocket = io("https://speedcraft-server.vercel.app/");
    setSocket(newSocket);
  
    return () => {
      newSocket.disconnect();
    };
  }, []);
  

  useEffect(() => {
    if (socket) {
      if (showCard){
        socket.emit("room_size", room);
        socket.emit("get_usernames_in_room",{room,username});
      }
      const handleUsernameAlreadyExist = () => {
        console.log("Username is already exist in room");
        setUserExistedInRoom(true);
      }
      const handleRoomFull = () => {
        console.log("Room full event received");
        setRoomFull(true);
      };
      socket.on("usernames_in_room", handleUsernameAlreadyExist);
      socket.on("max_size_reached", handleRoomFull);
  
      return () => {
        socket.off("max_size_reached", handleRoomFull);
        socket.off("usernames_in_room",handleUsernameAlreadyExist)
      };
    }
  }, [socket, username, room,showCard]);
  

  

  return (
    <div className="flex flex-col justify-between h-screen ">
      <header className="bg-blue-500 h-[50px] flex justify-center items-center">
        <Image src="/assets/logo.png" alt="logo" height={100} width={100} />
      </header>
      <div>
        {!showCard && (
          <>
            <div className="flex justify-center items-center">
            <div className="flex flex-col justify-center gap-4 px-16 bg-blue-500 h-[200px] w-[550px] rounded-lg">
              <div className="flex justify-between items-center">
                <h2>Enter Username</h2>
                <input
                  type="text"
                  className="py-1 px-2 rounded-sm sm:w-[200px] w-[120px] sm:text-md text-xs"
                  placeholder="Username"
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div className="flex justify-between items-center">
                <h2>Enter Room Number</h2>
                <input
                  required
                  className="py-1 px-2 rounded-sm sm:w-[200px] w-[120px] sm:text-md text-xs"
                  type="text"
                  placeholder="Can be anything"
                  onChange={(e) => setRoom(e.target.value)}
                />
              </div>

              <button
                className="bg-black rounded-md px-2 py-1 text-white"
                onClick={joinRoom}
              >
              Join Room
              </button>
            </div>{" "}
          </div>
          <div className="bg-gray-700 text-white w-[500px] h-p[200px] rounded-md px-3 py-3 mx-auto mt-6   ">
            <h2 className="text-lg font-bold">Instructions</h2>
            <ul className="list-disc pl-4">
              <li>The first player to enter the game is designated as the host.</li>
              <li>Only the host can initiate or start the game.</li>
              <li>Players can progress to the next word of the game only if the current word is correctly typed.</li>
              <li><span className="text-green-500">Green</span> color indicates that the word was correctly typed.</li>
              <li><span className="text-red-500">Red</span> color indicates that the word is attempted wrong at first.</li>
            </ul>
          </div>
          </>
        )}
        {showCard && !roomFull && !userExistedInRoom && (
        <Game username={username} room={room} />
         
        )}

        {roomFull && (
          <div className="flex justify-center flex-col items-center gap-2">

          <div className="flex justify-center items-center">
            <p>Room is full. Please try another room.</p>
          </div>

          <div>
            <button className="bg-black rounded-md px-3 py-1 font-bold text-white" onClick={handleGoBack}>Go Back</button>
          </div>
          </div>
        )}

        {userExistedInRoom && !roomFull && (
           <div className="flex justify-center flex-col items-center gap-2">

           <div className="flex justify-center items-center text-center">
             <p>Username is already present in the room. Please choose other username</p>
           </div>
 
           <div>
             <button className="bg-black rounded-md px-3 py-1 font-bold text-white" onClick={handleGoBack}>Go Back</button>
           </div>
           </div>
        )}
      </div>
      <footer className="bg-blue-500 h-[30px]">
        {/* footer */}
      </footer>
    </div>
  );
};

export default Enter;

//to run the server
// node --loader ts-node/esm .\index.ts
