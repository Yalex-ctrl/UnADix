import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Avatar } from '@/components/ui/Avatar';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import { T } from '@/components/ui/Typography';
import { pickPhoto } from '@/lib/pickPhoto';
import { fonts, OUTLINE, palette, PLAYER_COLORS, radius, space } from '@/theme/tokens';
import { PlayerProfile } from '@/types/profile';

export type ProfileDraft = { name: string; color: string; photoSourceUri?: string; removePhoto?: boolean };

type Props = {
  visible: boolean;
  title: string;
  initial?: PlayerProfile; // modification d'un profil existant
  defaultColor?: string;
  submitLabel: string;
  onClose: () => void;
  onSubmit: (draft: ProfileDraft) => void | Promise<void>;
};

// Création / modification d'un profil en 3 secondes : prénom, couleur, photo facultative.
export function ProfileEditor({ visible, title, onClose, ...rest }: Props) {
  return (
    <BottomSheet visible={visible} title={title} onClose={onClose}>
      {/* Le formulaire n'existe que tant que la feuille est ouverte : son état repart de zéro à chaque ouverture. */}
      {visible && <EditorForm {...rest} />}
    </BottomSheet>
  );
}

function EditorForm({ initial, defaultColor, submitLabel, onSubmit }: Omit<Props, 'visible' | 'title' | 'onClose'>) {
  const [name, setName] = useState(initial?.name ?? '');
  const [color, setColor] = useState(initial?.color ?? defaultColor ?? PLAYER_COLORS[0]);
  const [photoUri, setPhotoUri] = useState<string | undefined>(undefined); // nouvelle photo choisie
  const [removePhoto, setRemovePhoto] = useState(false);
  const [busy, setBusy] = useState(false);

  const choose = async (source: 'camera' | 'library') => {
    const uri = await pickPhoto(source);
    if (uri) {
      setPhotoUri(uri);
      setRemovePhoto(false);
    }
  };

  const submit = async () => {
    setBusy(true);
    try {
      await onSubmit({ name: name.trim(), color, photoSourceUri: photoUri, removePhoto });
    } finally {
      setBusy(false);
    }
  };

  const shownPhoto = removePhoto ? undefined : photoUri ?? initial?.photoUri;

  return (
    <>
      <View style={{ alignItems: 'center', gap: space.sm }}>
        <Avatar name={name || '?'} color={color} photoUri={shownPhoto} size={96} />
        <View style={{ flexDirection: 'row', gap: space.sm, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Button label="Photo" icon="camera" variant="secondary" onPress={() => choose('camera')} />
          <Button label="Galerie" icon="image" variant="secondary" onPress={() => choose('library')} />
          {shownPhoto && (
            <Button
              label="Retirer"
              icon="trash-2"
              variant="ghost"
              onPress={() => {
                setPhotoUri(undefined);
                setRemovePhoto(true);
              }}
            />
          )}
        </View>
      </View>

      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Prénom"
        placeholderTextColor={palette.inkFaint}
        maxLength={20}
        autoFocus={!initial}
        accessibilityLabel="Prénom du joueur"
        style={styles.input}
      />

      <View style={styles.colors}>
        {PLAYER_COLORS.map((c) => (
          <Pressable
            key={c}
            onPress={() => setColor(c)}
            accessibilityRole="button"
            accessibilityLabel={`Couleur ${c}`}
            accessibilityState={{ selected: c === color }}
            style={[styles.swatch, { backgroundColor: c }, c === color && styles.swatchOn]}
          />
        ))}
      </View>

      <Button label={submitLabel} size="l" disabled={!name.trim() || busy} onPress={submit} />
      <T variant="caption" color={palette.inkSoft} center>
        La photo reste sur ce téléphone.
      </T>
    </>
  );
}

const styles = StyleSheet.create({
  input: {
    minHeight: 52,
    backgroundColor: palette.surface,
    borderRadius: radius.button,
    borderWidth: OUTLINE,
    borderColor: palette.line,
    paddingHorizontal: 16,
    fontFamily: fonts.bold,
    fontSize: 18,
    color: palette.ink,
  },
  colors: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
  swatch: { width: 36, height: 36, borderRadius: 18, borderWidth: OUTLINE, borderColor: palette.line },
  swatchOn: { borderWidth: 4, transform: [{ scale: 1.1 }] },
});
