import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { mockRoomAdapter } from '@/lib/network/mockRoomAdapter';
import { Room, RoomAdapter } from '@/types/room';

// Swap this for a real backend-backed adapter later — no other file needs to
// change, since every screen only talks to useRoom()/RoomAdapter.
const adapter: RoomAdapter = mockRoomAdapter;

type RoomContextValue = {
  room: Room | null;
  selfId: string | null;
  isHost: boolean;
  createRoom: (hostName: string) => Promise<void>;
  joinRoom: (code: string, playerName: string) => Promise<void>;
  setReady: (ready: boolean) => Promise<void>;
  startGame: () => Promise<void>;
  leaveRoom: () => Promise<void>;
};

const RoomContext = createContext<RoomContextValue | null>(null);

export function RoomProvider({ children }: { children: React.ReactNode }) {
  const [room, setRoom] = useState<Room | null>(null);
  const [selfId, setSelfId] = useState<string | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    return () => unsubscribeRef.current?.();
  }, []);

  const subscribe = useCallback((code: string) => {
    unsubscribeRef.current?.();
    unsubscribeRef.current = adapter.subscribeToRoom(code, setRoom);
  }, []);

  const createRoom = useCallback(
    async (hostName: string) => {
      const newRoom = await adapter.createRoom(hostName);
      setRoom(newRoom);
      setSelfId(newRoom.hostId);
      subscribe(newRoom.code);
    },
    [subscribe]
  );

  const joinRoom = useCallback(
    async (code: string, playerName: string) => {
      const joinedRoom = await adapter.joinRoom(code, playerName);
      const self = joinedRoom.players[joinedRoom.players.length - 1];
      setRoom(joinedRoom);
      setSelfId(self.id);
      subscribe(joinedRoom.code);
    },
    [subscribe]
  );

  const setReady = useCallback(
    async (ready: boolean) => {
      if (!room || !selfId) return;
      await adapter.setReady(room.code, selfId, ready);
    },
    [room, selfId]
  );

  const startGame = useCallback(async () => {
    if (!room) return;
    await adapter.startGame(room.code);
  }, [room]);

  const leaveRoom = useCallback(async () => {
    if (room && selfId) await adapter.leaveRoom(room.code, selfId);
    unsubscribeRef.current?.();
    unsubscribeRef.current = null;
    setRoom(null);
    setSelfId(null);
  }, [room, selfId]);

  const isHost = !!room && !!selfId && room.hostId === selfId;

  const value = useMemo<RoomContextValue>(
    () => ({ room, selfId, isHost, createRoom, joinRoom, setReady, startGame, leaveRoom }),
    [room, selfId, isHost, createRoom, joinRoom, setReady, startGame, leaveRoom]
  );

  return <RoomContext.Provider value={value}>{children}</RoomContext.Provider>;
}

export function useRoom() {
  const ctx = useContext(RoomContext);
  if (!ctx) throw new Error('useRoom must be used within a RoomProvider');
  return ctx;
}
