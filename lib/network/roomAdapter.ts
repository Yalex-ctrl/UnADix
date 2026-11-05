export type { Room, RoomAdapter, RoomPlayer, RoomPlayerStatus } from '@/types/room';

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no 0/O or 1/I, avoids ambiguity when read aloud

export function generateRoomCode(length = 5): string {
  let code = '';
  for (let i = 0; i < length; i++) {
    code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  }
  return code;
}
