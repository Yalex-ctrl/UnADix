import { StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useProfiles } from '@/context/ProfilesContext';
import { fonts, OUTLINE, palette } from '@/theme/tokens';

type AvatarProps = {
  name: string;
  color?: string;
  profileId?: string; // photo/émoji retrouvés dans le profil
  photoUri?: string;
  emoji?: string;
  size?: number;
  ring?: boolean; // anneau de la couleur du joueur (joueur actif)
};

// Avatar rond : photo si le profil en a une, sinon émoji, sinon initiale sur
// la couleur du joueur. Toujours cerclé d'encre.
export function Avatar({ name, color = palette.brand, profileId, photoUri, emoji, size = 40, ring }: AvatarProps) {
  const { getProfile } = useProfiles();
  const profile = getProfile(profileId);
  const uri = photoUri ?? profile?.photoUri;
  const glyph = emoji ?? profile?.avatarEmoji;
  const fill = color ?? profile?.color ?? palette.brand;

  return (
    <View
      accessibilityLabel={`Avatar de ${name}`}
      style={[
        styles.wrap,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: fill },
        ring && { borderColor: fill, borderWidth: 3, padding: 2, backgroundColor: palette.surface },
      ]}
    >
      <View style={[styles.inner, { borderRadius: size / 2, backgroundColor: fill }]}>
        {uri ? (
          <Image source={{ uri }} style={StyleSheet.absoluteFill} contentFit="cover" cachePolicy="memory-disk" />
        ) : glyph ? (
          <Text style={{ fontSize: size * 0.5 }}>{glyph}</Text>
        ) : (
          <Text style={[styles.initial, { fontSize: size * 0.46, color: palette.ink }]}>
            {name.trim().slice(0, 1).toUpperCase() || '?'}
          </Text>
        )}
      </View>
    </View>
  );
}

export function AvatarStack({
  players,
  size = 32,
  max = 5,
}: {
  players: { name: string; color?: string; profileId?: string }[];
  size?: number;
  max?: number;
}) {
  const shown = players.slice(0, max);
  return (
    <View style={{ flexDirection: 'row' }}>
      {shown.map((p, i) => (
        <View key={`${p.profileId ?? p.name}-${i}`} style={{ marginLeft: i === 0 ? 0 : -size * 0.3 }}>
          <Avatar name={p.name} color={p.color} profileId={p.profileId} size={size} />
        </View>
      ))}
      {players.length > max && (
        <View style={[styles.more, { width: size, height: size, borderRadius: size / 2, marginLeft: -size * 0.3 }]}>
          <Text style={styles.moreText}>+{players.length - max}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { borderWidth: OUTLINE, borderColor: palette.line, overflow: 'hidden' },
  inner: { flex: 1, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  initial: { fontFamily: fonts.display },
  more: { backgroundColor: palette.surface, borderWidth: OUTLINE, borderColor: palette.line, alignItems: 'center', justifyContent: 'center' },
  moreText: { fontFamily: fonts.bold, fontSize: 12, color: palette.ink },
});
