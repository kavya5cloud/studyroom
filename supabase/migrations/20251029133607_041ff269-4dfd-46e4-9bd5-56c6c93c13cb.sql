-- Create study rooms table
CREATE TABLE public.study_rooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  timer_state TEXT NOT NULL DEFAULT 'idle',
  time_left INTEGER DEFAULT 0,
  selected_duration INTEGER,
  sessions_completed INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create room participants table
CREATE TABLE public.room_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES public.study_rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  is_online BOOLEAN DEFAULT true,
  last_seen TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(room_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE public.study_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_participants ENABLE ROW LEVEL SECURITY;

-- RLS Policies for study_rooms
CREATE POLICY "Anyone can view study rooms"
  ON public.study_rooms FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create study rooms"
  ON public.study_rooms FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Room participants can update rooms"
  ON public.study_rooms FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.room_participants
      WHERE room_id = id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Room creator can delete room"
  ON public.study_rooms FOR DELETE
  USING (created_by = auth.uid());

-- RLS Policies for room_participants
CREATE POLICY "Anyone can view room participants"
  ON public.room_participants FOR SELECT
  USING (true);

CREATE POLICY "Anyone can join rooms"
  ON public.room_participants FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own participant record"
  ON public.room_participants FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can leave rooms"
  ON public.room_participants FOR DELETE
  USING (user_id = auth.uid());

-- Enable realtime for both tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.study_rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.room_participants;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for study_rooms
CREATE TRIGGER update_study_rooms_updated_at
  BEFORE UPDATE ON public.study_rooms
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();