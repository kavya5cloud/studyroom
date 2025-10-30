import { useState } from "react";
import { LandingPage } from "@/components/LandingPage";
import { TimerApp } from "@/components/TimerApp";
import { RoomsList } from "@/components/RoomsList";
import { MultiplayerRoom } from "@/components/MultiplayerRoom";
import { ChatCompanion } from "@/components/ChatCompanion";

type ViewState = "landing" | "solo-timer" | "rooms-list" | "multiplayer-room";

const Index = () => {
  const [view, setView] = useState<ViewState>("landing");
  const [currentRoom, setCurrentRoom] = useState<{ id: string; name: string; username: string } | null>(null);

  const handleJoinRoom = (roomId: string, roomName: string, username: string) => {
    setCurrentRoom({ id: roomId, name: roomName, username });
    setView("multiplayer-room");
  };

  return (
    <>
      {view === "landing" && (
        <LandingPage 
          onStartSolo={() => setView("solo-timer")}
          onStartMultiplayer={() => setView("rooms-list")}
        />
      )}
      
      {view === "solo-timer" && (
        <TimerApp onBack={() => setView("landing")} />
      )}
      
      {view === "rooms-list" && (
        <RoomsList 
          onBack={() => setView("landing")}
          onJoinRoom={(roomId, roomName) => {
            const username = prompt("Enter your username:");
            if (username) handleJoinRoom(roomId, roomName, username);
          }}
        />
      )}
      
      {view === "multiplayer-room" && currentRoom && (
        <MultiplayerRoom
          roomId={currentRoom.id}
          roomName={currentRoom.name}
          username={currentRoom.username}
          onLeave={() => setView("rooms-list")}
        />
      )}
      
      <ChatCompanion />
    </>
  );
};

export default Index;
