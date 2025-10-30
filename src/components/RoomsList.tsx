import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Users, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Room {
  id: string;
  name: string;
  created_at: string;
  participant_count?: number;
}

interface RoomsListProps {
  onBack: () => void;
  onJoinRoom: (roomId: string, roomName: string) => void;
}

export const RoomsList = ({ onBack, onJoinRoom }: RoomsListProps) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [newRoomName, setNewRoomName] = useState("");
  const [username, setUsername] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadRooms();
    
    const channel = supabase
      .channel('rooms-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'study_rooms' }, () => {
        loadRooms();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadRooms = async () => {
    const { data, error } = await supabase
      .from('study_rooms')
      .select(`
        *,
        room_participants(count)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading rooms:', error);
      return;
    }

    setRooms(data || []);
  };

  const createRoom = async () => {
    if (!newRoomName.trim() || !username.trim()) {
      toast({
        title: "Missing information",
        description: "Please enter both room name and your username",
        variant: "destructive",
      });
      return;
    }

    const { data: room, error: roomError } = await supabase
      .from('study_rooms')
      .insert({ name: newRoomName })
      .select()
      .single();

    if (roomError || !room) {
      toast({
        title: "Error",
        description: "Failed to create room",
        variant: "destructive",
      });
      return;
    }

    await joinRoom(room.id, room.name);
  };

  const joinRoom = async (roomId: string, roomName: string) => {
    if (!username.trim()) {
      toast({
        title: "Username required",
        description: "Please enter your username to join",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from('room_participants')
      .insert({
        room_id: roomId,
        username: username,
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to join room",
        variant: "destructive",
      });
      return;
    }

    onJoinRoom(roomId, roomName);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#8B6F47] to-[#5C4A3A] p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="outline"
            onClick={onBack}
            className="bg-[#EDE4D4] border-2 border-[#8B6F47] text-[#5C4A3A] hover:bg-[#F5E6D3]"
          >
            <ArrowLeft className="mr-2 w-4 h-4" />
            Back
          </Button>
          
          <h1 className="text-3xl font-bold text-[#EDE4D4] italic font-playfair">
            Study Rooms
          </h1>

          <Button
            variant="vintage"
            onClick={() => setShowCreateForm(!showCreateForm)}
          >
            <Plus className="mr-2" />
            Create Room
          </Button>
        </div>

        {showCreateForm && (
          <Card className="bg-[#EDE4D4] border-4 border-[#8B6F47] p-6 mb-6">
            <h3 className="text-xl font-bold text-[#5C4A3A] mb-4 italic font-playfair">
              Create New Room
            </h3>
            <div className="space-y-4">
              <Input
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="border-2 border-[#8B6F47]"
              />
              <Input
                placeholder="Room name"
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                className="border-2 border-[#8B6F47]"
              />
              <Button variant="vintage" onClick={createRoom} className="w-full">
                Create & Join
              </Button>
            </div>
          </Card>
        )}

        {!username && !showCreateForm && (
          <Card className="bg-[#EDE4D4] border-4 border-[#8B6F47] p-6 mb-6">
            <Input
              placeholder="Enter your username to join rooms"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="border-2 border-[#8B6F47]"
            />
          </Card>
        )}

        <div className="grid gap-4">
          {rooms.map((room) => (
            <Card
              key={room.id}
              className="bg-[#EDE4D4] border-4 border-[#8B6F47] p-6 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-[#5C4A3A] font-playfair">
                    {room.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-2 text-[#5C4A3A]">
                    <Users className="w-4 h-4" />
                    <span>{room.participant_count || 0} studying</span>
                  </div>
                </div>
                <Button
                  variant="vintage"
                  onClick={() => joinRoom(room.id, room.name)}
                  disabled={!username}
                >
                  Join Room
                </Button>
              </div>
            </Card>
          ))}

          {rooms.length === 0 && (
            <Card className="bg-[#EDE4D4] border-4 border-[#8B6F47] p-12 text-center">
              <p className="text-xl text-[#5C4A3A] italic font-playfair">
                No study rooms yet. Create one to get started!
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
