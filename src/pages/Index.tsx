import { useState } from "react";
import { LandingPage } from "@/components/LandingPage";
import { TimerApp } from "@/components/TimerApp";

const Index = () => {
  const [showTimer, setShowTimer] = useState(false);

  return (
    <>
      {!showTimer ? (
        <LandingPage onStart={() => setShowTimer(true)} />
      ) : (
        <TimerApp onBack={() => setShowTimer(false)} />
      )}
    </>
  );
};

export default Index;
