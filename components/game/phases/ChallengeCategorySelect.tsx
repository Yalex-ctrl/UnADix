import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { ScreenBody } from '@/components/ui/Screen';
import { T } from '@/components/ui/Typography';
import { CATEGORIES } from '@/data/categories';
import { searchCategories } from '@/lib/search';
import { fonts, palette, radius } from '@/theme/tokens';

type ChallengeCategorySelectProps = {
  player: { name: string; color: string };
  onChoose: (categoryId: string) => void;
};

export function ChallengeCategorySelect({ player, onChoose }: ChallengeCategorySelectProps) {
  const [query, setQuery] = useState('');
  const results = useMemo(() => searchCategories(query, CATEGORIES), [query]);

  return (
    <ScreenBody gap={12}>
      <View style={{ gap: 4 }}>
        <T variant="caption" color={palette.gold} style={{ letterSpacing: 1 }}>
          MODE CHALLENGER
        </T>
        <T variant="title" color={player.color}>
          {player.name}, choisis ton thème
        </T>
      </View>
      <View style={styles.search}>
        <Feather name="search" size={18} color={palette.textFaint} />
        <TextInput
          style={styles.input}
          value={query}
          onChangeText={setQuery}
          placeholder="Rechercher un thème (ex : star wars)"
          placeholderTextColor={palette.textFaint}
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
          clearButtonMode="while-editing"
          accessibilityLabel="Rechercher un thème"
        />
      </View>
      <T variant="caption" color={palette.textMuted}>
        {results.length} thème{results.length > 1 ? 's' : ''}
      </T>
      {results.length === 0 && (
        <T variant="body" color={palette.textMuted} center>
          Aucun thème ne correspond à cette recherche.
        </T>
      )}
      <View style={{ gap: 8 }}>
        {results.map((c) => (
          <Pressable key={c.id} style={({ pressed }) => [styles.option, pressed && { opacity: 0.8 }]} onPress={() => onChoose(c.id)}>
            <T variant="body" style={styles.optionText}>
              {c.name}
            </T>
            <Feather name="chevron-right" size={18} color={palette.textFaint} />
          </Pressable>
        ))}
      </View>
    </ScreenBody>
  );
}

const styles = StyleSheet.create({
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: palette.surface,
    borderRadius: radius.button,
    borderWidth: 1,
    borderColor: palette.border,
    paddingHorizontal: 14,
    minHeight: 48,
  },
  input: { flex: 1, fontFamily: fonts.regular, fontSize: 16, color: palette.text, paddingVertical: 10 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: palette.surface,
    borderRadius: radius.button,
    borderWidth: 1,
    borderColor: palette.border,
    paddingHorizontal: 16,
    minHeight: 52,
  },
  optionText: { flex: 1, fontFamily: fonts.semibold },
});
