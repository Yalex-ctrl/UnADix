import { Room, RoomAdapter, RoomPlayer } from '@/types/room';
import { generateRoomCode } from './roomAdapter';

// This mock is intentionally single-runtime (an in-memory Map, no
// localStorage/BroadcastChannel): the multiplayer flow is a UI/UX preview,
// not real cross-device sync yet. Swapping in a real backend later means
// writing a new RoomAdapter implementation and pointing context/RoomContext.tsx
// at it — nothing else changes.
//
// To make the lobby feel alive without a second physical device, createRoom
// spawns 1-3 simulated players that auto-join and auto-ready after short
// random delays.

const SIMULATED_NAMES = ['Alex', 'Sam', 'Noa', 'Léa', 'Théo', 'Manon', 'Yanis', 'Chloé'];

const rooms = new Map<string, Room>();
const listeners = new Map<string, Set<(room: Room) => void>>();

function notify(code: string) {
  const room = rooms.get(code);
  if (!room) return;
  listeners.get(code)?.forEach((cb) => cb(room));
}

function update(code: string, updater: (room: Room) => Room): Room | undefined {
  const room = rooms.get(code);
  if (!room) return undefined;
  const next = updater(room);
  rooms.set(code, next);
  notify(code);
  return next;
}

function randomId(): string {
  return `p-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
}

function spawnSimulatedPlayers(code: string) {
  const count = 1 + Math.floor(Math.random() * 3);
  const names = [...SIMULATED_NAMES].sort(() => Math.random() - 0.5).slice(0, count);
  names.forEach((name, idx) => {
    const joinDelay = 700 + idx * 500 + Math.random() * 600;
    setTimeout(() => {
      const simId = randomId();
      update(code, (room) => ({
        ...room,
        players: [...room.players, { id: simId, name, isHost: false, status: 'connecting' }],
      }));
      const readyDelay = 500 + Math.random() * 900;
      setTimeout(() => {
        update(code, (room) => ({
          ...room,
          players: room.players.map((p) => (p.id === simId ? { ...p, status: 'ready' } : p)),
        }));
      }, readyDelay);
    }, joinDelay);
  });
}

export const mockRoomAdapter: RoomAdapter = {
  async createRoom(hostName) {
    const code = generateRoomCode();
    const hostId = randomId();
    const room: Room = {
      code,
      hostId,
      players: [{ id: hostId, name: hostName.trim() || 'Hôte', isHost: true, status: 'ready' }],
      createdAt: Date.now(),
    };
    rooms.set(code, room);
    spawnSimulatedPlayers(code);
    return room;
  },

  async joinRoom(code, playerName) {
    const key = code.trim().toUpperCase();
    if (!rooms.has(key)) {
      throw new Error('Salon introuvable. Vérifie le code.');
    }
    const player: RoomPlayer = {
      id: randomId(),
      name: playerName.trim() || 'Joueur',
      isHost: false,
      status: 'ready',
    };
    const next = update(key, (room) => ({ ...room, players: [...room.players, player] }));
    return next!;
  },

  subscribeToRoom(code, onUpdate) {
    const key = code.trim().toUpperCase();
    if (!listeners.has(key)) listeners.set(key, new Set());
    listeners.get(key)!.add(onUpdate);
    const current = rooms.get(key);
    if (current) onUpdate(current);
    return () => {
      listeners.get(key)?.delete(onUpdate);
    };
  },

  async setReady(code, playerId, ready) {
    update(code.trim().toUpperCase(), (room) => ({
      ...room,
      players: room.players.map((p) => (p.id === playerId ? { ...p, status: ready ? 'ready' : 'not-ready' } : p)),
    }));
  },

  async startGame() {
    // No-op for the mock: once the host navigates away from the lobby,
    // gameplay runs on the local GameContext (see app/multiplayer/lobby.tsx).
  },

  async leaveRoom(code, playerId) {
    update(code.trim().toUpperCase(), (room) => ({
      ...room,
      players: room.players.filter((p) => p.id !== playerId),
    }));
  },
};
