import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Volume2, ArrowLeft, Users, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Participant {
  id: string;
  username: string;
  is_online: boolean;
}

interface ChatMessage {
  id: string;
  username: string;
  message: string;
  timestamp: string;
}

interface MultiplayerRoomProps {
  roomId: string;
  roomName: string;
  username: string;
  onLeave: () => void;
}

type TimerState = "idle" | "work" | "break" | "completed";

export const MultiplayerRoom = ({ roomId, roomName, username, onLeave }: MultiplayerRoomProps) => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null);
  const [timerState, setTimerState] = useState<TimerState>("idle");
  const [timeLeft, setTimeLeft] = useState(0);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const participantIdRef = useRef<string | null>(null);
  const { toast } = useToast();

  const durations = [15, 30, 45, 60];
  const BREAK_TIME = 5 * 60;

  useEffect(() => {
    joinRoom();
    loadParticipants();
    
    const participantsChannel = supabase
      .channel('room-participants-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'room_participants',
        filter: `room_id=eq.${roomId}`
      }, () => {
        loadParticipants();
      })
      .subscribe();

    const roomChannel = supabase
      .channel(`room-${roomId}`)
      .on('broadcast', { event: 'chat-message' }, (payload) => {
        setChatMessages(prev => [...prev, payload.payload as ChatMessage]);
      })
      .on('presence', { event: 'sync' }, () => {
        const state = roomChannel.presenceState();
        console.log('Presence state:', state);
      })
      .subscribe();

    const heartbeat = setInterval(updatePresence, 30000);

    return () => {
      leaveRoom();
      supabase.removeChannel(participantsChannel);
      supabase.removeChannel(roomChannel);
      clearInterval(heartbeat);
    };
  }, [roomId]);

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

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const joinRoom = async () => {
    const { data, error } = await supabase
      .from('room_participants')
      .insert({
        room_id: roomId,
        username: username,
      })
      .select()
      .single();

    if (data) {
      participantIdRef.current = data.id;
    }
  };

  const leaveRoom = async () => {
    if (participantIdRef.current) {
      await supabase
        .from('room_participants')
        .delete()
        .eq('id', participantIdRef.current);
    }
  };

  const updatePresence = async () => {
    if (participantIdRef.current) {
      await supabase
        .from('room_participants')
        .update({ last_seen: new Date().toISOString() })
        .eq('id', participantIdRef.current);
    }
  };

  const loadParticipants = async () => {
    const { data, error } = await supabase
      .from('room_participants')
      .select('*')
      .eq('room_id', roomId);

    if (data) {
      setParticipants(data);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const message: ChatMessage = {
      id: crypto.randomUUID(),
      username,
      message: newMessage,
      timestamp: new Date().toISOString(),
    };

    const channel = supabase.channel(`room-${roomId}`);
    await channel.send({
      type: 'broadcast',
      event: 'chat-message',
      payload: message,
    });

    setChatMessages(prev => [...prev, message]);
    setNewMessage("");
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
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getDialogue = () => {
    if (timerState === "idle") return "What's the plan for today?";
    if (timerState === "work") return "Stay focused! You're doing great!";
    if (timerState === "break") return "Take it easy for a bit. You've earned it!";
    return "I didn't expect you would do this! Good job!";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#8B6F47] to-[#5C4A3A] p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="outline"
            onClick={() => {
              leaveRoom();
              onLeave();
            }}
            className="bg-[#EDE4D4] border-2 border-[#8B6F47] text-[#5C4A3A] hover:bg-[#F5E6D3]"
          >
            <ArrowLeft className="mr-2 w-4 h-4" />
            Leave Room
          </Button>
          
          <h2 className="text-2xl font-bold text-[#EDE4D4] italic font-playfair">
            {roomName}
          </h2>

          <div className="flex items-center gap-3 bg-[#EDE4D4] border-2 border-[#8B6F47] rounded-full px-6 py-3 shadow-lg">
            <Volume2 className="w-5 h-5 text-[#6B1010]" />
            <div className="w-32 h-2 bg-[#5C4A3A]/20 rounded-full overflow-hidden">
              <div className="h-full w-3/4 bg-[#6B1010] rounded-full" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Timer Area */}
          <div className="lg:col-span-2">
            <Card className="bg-[#EDE4D4] border-8 border-[#8B6F47] p-8 shadow-2xl">
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

              {timerState === "idle" && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-center text-[#5C4A3A] italic font-playfair">
                    Select session duration
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {durations.map((duration) => (
                      <Button
                        key={duration}
                        variant={selectedDuration === duration ? "default" : "outline"}
                        size="lg"
                        onClick={() => setSelectedDuration(duration)}
                        className={selectedDuration === duration ? "bg-[#6B1010] text-[#F5E6D3]" : ""}
                      >
                        {duration}
                      </Button>
                    ))}
                  </div>
                  {selectedDuration && (
                    <div className="text-center">
                      <Button variant="vintage" size="xl" onClick={handleStart}>
                        Start Session
                      </Button>
                    </div>
                  )}
                </div>
              )}

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
                    <Button variant="destructive" size="lg" onClick={handleEnd}>
                      End Session
                    </Button>
                  </div>
                </div>
              )}

              {timerState === "completed" && (
                <div className="space-y-8 text-center">
                  <div className="text-6xl md:text-7xl font-bold text-[#6B1010] font-playfair">
                    Complete!
                  </div>
                  <div className="text-2xl text-[#5C4A3A]">
                    Sessions completed: {sessionsCompleted}
                  </div>
                  <Button variant="vintage" size="xl" onClick={() => setTimerState("idle")}>
                    Start Another Session
                  </Button>
                </div>
              )}
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Participants */}
            <Card className="bg-[#EDE4D4] border-4 border-[#8B6F47] p-4">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-[#6B1010]" />
                <h3 className="font-bold text-[#5C4A3A] font-playfair">
                  Studying ({participants.length})
                </h3>
              </div>
              <ScrollArea className="h-32">
                {participants.map((p) => (
                  <div key={p.id} className="flex items-center gap-2 py-2">
                    <div className={`w-2 h-2 rounded-full ${p.is_online ? 'bg-green-500' : 'bg-gray-400'}`} />
                    <span className="text-[#5C4A3A]">{p.username}</span>
                  </div>
                ))}
              </ScrollArea>
            </Card>

            {/* Chat */}
            <Card className="bg-[#EDE4D4] border-4 border-[#8B6F47] p-4">
              <h3 className="font-bold text-[#5C4A3A] mb-4 font-playfair">
                Room Chat
              </h3>
              <ScrollArea className="h-64 mb-4 border-2 border-[#8B6F47] rounded p-2">
                {chatMessages.map((msg) => (
                  <div key={msg.id} className="mb-3">
                    <span className="font-bold text-[#6B1010]">{msg.username}: </span>
                    <span className="text-[#5C4A3A]">{msg.message}</span>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </ScrollArea>
              <div className="flex gap-2">
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  className="border-2 border-[#8B6F47]"
                />
                <Button variant="vintage" size="icon" onClick={sendMessage}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
