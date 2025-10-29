import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Volume2, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TimerAppProps {
  onBack: () => void;
}

type TimerState = "idle" | "work" | "break" | "completed";

export const TimerApp = ({ onBack }: TimerAppProps) => {
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null);
  const [timerState, setTimerState] = useState<TimerState>("idle");
  const [timeLeft, setTimeLeft] = useState(0);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const { toast } = useToast();

  const durations = [15, 30, 45, 60];
  const BREAK_TIME = 5 * 60; // 5 minutes in seconds

  useEffect(() => {
    if (timerState === "work" || timerState === "break") {
      const interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (timerState === "work") {
              setTimerState("break");
              setTimeLeft(BREAK_TIME);
              toast({
                title: "Break time!",
                description: "Great work! Take a 5-minute break.",
              });
            } else {
              setTimerState("completed");
              setSessionsCompleted((prev) => prev + 1);
              toast({
                title: "Session complete!",
                description: "I didn't expect you would do this! Good job!",
              });
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [timerState, toast]);

  const handleDurationSelect = (minutes: number) => {
    setSelectedDuration(minutes);
  };

  const handleStart = () => {
    if (selectedDuration) {
      setTimerState("work");
      setTimeLeft(selectedDuration * 60);
    }
  };

  const handleEnd = () => {
    setTimerState("idle");
    setTimeLeft(0);
    setSelectedDuration(null);
    toast({
      title: "Session ended",
      description: "Oh I see... well that's too bad I gotta go now.",
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getDialogue = () => {
    if (timerState === "idle") {
      return "What's the plan for today?";
    } else if (timerState === "work") {
      return "Stay focused! You're doing great!";
    } else if (timerState === "break") {
      return "Take it easy for a bit. You've earned it!";
    } else {
      return "I didn't expect you would do this! Good job!";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#8B6F47] to-[#5C4A3A] p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="outline"
            onClick={onBack}
            className="bg-[#EDE4D4] border-2 border-[#8B6F47] text-[#5C4A3A] hover:bg-[#F5E6D3]"
          >
            <ArrowLeft className="mr-2 w-4 h-4" />
            Back
          </Button>
          
          {/* Volume control */}
          <div className="flex items-center gap-3 bg-[#EDE4D4] border-2 border-[#8B6F47] rounded-full px-6 py-3 shadow-lg">
            <Volume2 className="w-5 h-5 text-[#6B1010]" />
            <div className="w-32 h-2 bg-[#5C4A3A]/20 rounded-full overflow-hidden">
              <div className="h-full w-3/4 bg-[#6B1010] rounded-full" />
            </div>
          </div>
        </div>

        {/* Main content */}
        <Card className="bg-[#EDE4D4] border-8 border-[#8B6F47] p-8 md:p-12 shadow-2xl">
          {/* Dialogue */}
          <div className="bg-[#F5E6D3] border-4 border-[#8B6F47] rounded-lg p-6 mb-8 shadow-lg">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-[#6B1010] flex items-center justify-center flex-shrink-0">
                <span className="text-[#F5E6D3] text-sm">♪</span>
              </div>
              <p className="text-xl text-[#5C4A3A] italic font-playfair">
                "{getDialogue()}"
              </p>
            </div>
          </div>

          {/* Session duration selector */}
          {timerState === "idle" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-center text-[#5C4A3A] italic font-playfair">
                Select your session duration
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {durations.map((duration) => (
                  <Button
                    key={duration}
                    variant={selectedDuration === duration ? "default" : "outline"}
                    size="lg"
                    onClick={() => handleDurationSelect(duration)}
                    className={`text-xl font-bold ${
                      selectedDuration === duration
                        ? "bg-[#6B1010] text-[#F5E6D3] hover:bg-[#6B1010]/90"
                        : "border-2 border-[#6B1010] text-[#6B1010] hover:bg-[#6B1010] hover:text-[#F5E6D3]"
                    }`}
                  >
                    {duration}
                  </Button>
                ))}
              </div>
              {selectedDuration && (
                <div className="text-center">
                  <Button
                    variant="vintage"
                    size="xl"
                    onClick={handleStart}
                    className="italic font-playfair"
                  >
                    Start Session
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Timer display */}
          {(timerState === "work" || timerState === "break") && (
            <div className="space-y-8">
              <div className="text-center">
                <p className="text-lg text-[#5C4A3A] mb-2 italic font-playfair">
                  {timerState === "work" ? "Work Time" : "Break Time"}
                </p>
                <div className="text-7xl md:text-8xl font-bold text-[#6B1010] font-playfair">
                  {formatTime(timeLeft)}
                </div>
              </div>
              <div className="text-center">
                <Button
                  variant="destructive"
                  size="lg"
                  onClick={handleEnd}
                  className="bg-[#5C4A3A] text-[#F5E6D3] hover:bg-[#5C4A3A]/90"
                >
                  End Session
                </Button>
              </div>
            </div>
          )}

          {/* Completion state */}
          {timerState === "completed" && (
            <div className="space-y-8 text-center">
              <div className="text-6xl md:text-7xl font-bold text-[#6B1010] font-playfair">
                Complete!
              </div>
              <div className="text-2xl text-[#5C4A3A]">
                Sessions completed: {sessionsCompleted}
              </div>
              <Button
                variant="vintage"
                size="xl"
                onClick={() => setTimerState("idle")}
                className="italic font-playfair"
              >
                Start Another Session
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
