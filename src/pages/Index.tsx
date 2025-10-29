import { useState } from "react";
import { LandingPage } from "@/components/LandingPage";
import { TimerApp } from "@/components/TimerApp";
import { ChatCompanion } from "@/components/ChatCompanion";

const Index = () => {
  const [showTimer, setShowTimer] = useState(false);

  return (
    <>
      {!showTimer ? (
        <LandingPage onStart={() => setShowTimer(true)} />
      ) : (
        <TimerApp onBack={() => setShowTimer(false)} />
      )}
      <ChatCompanion />
    </>
  );
};

export default Index;
