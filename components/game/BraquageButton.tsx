import { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/constants/theme';
import { Button } from '@/components/ui/Button';
import { PlayerChip } from '@/components/ui/PlayerChip';
import { ConnectionMode } from '@/types';

type BraquageButtonProps = {
  eligiblePlayers: { id: string; name: string }[];
  connectionMode: ConnectionMode;
  onBraquage: (braqueurId: string) => void;
};

// Interruption control, offered any time a question is on screen for a
// specific player, until the answer is revealed. Solo mode: the organizer
// taps and picks who declared "Je te braque" out loud. Multi mode: framed as
// each player's own button — still resolved by picking from this list since
// there is no real per-device input yet (see mockRoomAdapter).
export function BraquageButton({ eligiblePlayers, connectionMode, onBraquage }: BraquageButtonProps) {
  const [open, setOpen] = useState(false);

  if (eligiblePlayers.length === 0) return null;

  return (
    <View style={styles.wrap}>
      <Button
        label={open ? 'Annuler' : '🔴 Braquage'}
        variant={open ? 'secondary' : 'braquage'}
        onPress={() => setOpen((v) => !v)}
      />
      {open && (
        <View style={styles.picker}>
          <Text style={styles.pickerLabel}>
            {connectionMode === 'solo' ? 'Qui déclare "Je te braque" ?' : 'Qui appuie sur son bouton Braquage ?'}
          </Text>
          <View style={styles.pickerList}>
            {eligiblePlayers.map((p) => (
              <PlayerChip
                key={p.id}
                name={p.name}
                accentColor={colors.braquage}
                onPress={() => {
                  setOpen(false);
                  onBraquage(p.id);
                }}
              />
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 16,
    alignItems: 'center',
    width: '100%',
  },
  picker: {
    marginTop: 12,
    width: '100%',
  },
  pickerLabel: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  pickerList: {
    gap: 8,
  },
});
