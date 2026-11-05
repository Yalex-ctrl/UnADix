export type RoomPlayerStatus = 'connecting' | 'ready' | 'not-ready';

export type RoomPlayer = {
  id: string;
  name: string;
  isHost: boolean;
  status: RoomPlayerStatus;
};

export type Room = {
  code: string;
  hostId: string;
  players: RoomPlayer[];
  createdAt: number;
};

// This is the seam for swapping in a real backend (Firebase/Supabase/etc.)
// later without touching any UI: implement this interface and swap the
// instance created in context/RoomContext.tsx.
export type RoomAdapter = {
  createRoom: (hostName: string) => Promise<Room>;
  joinRoom: (code: string, playerName: string) => Promise<Room>;
  subscribeToRoom: (code: string, onUpdate: (room: Room) => void) => () => void;
  setReady: (code: string, playerId: string, ready: boolean) => Promise<void>;
  startGame: (code: string) => Promise<void>;
  leaveRoom: (code: string, playerId: string) => Promise<void>;
};
