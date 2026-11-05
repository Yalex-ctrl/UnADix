import { useMemo, useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet } from 'react-native';
import { colors } from '@/constants/theme';
import { CATEGORIES } from '@/data/categories';
import { searchCategories } from '@/lib/search';
import { gameStyles } from '../gameStyles';

type ChallengeCategorySelectProps = {
  playerName: string;
  onChoose: (categoryId: string) => void;
};

export function ChallengeCategorySelect({ playerName, onChoose }: ChallengeCategorySelectProps) {
  const [query, setQuery] = useState('');
  const results = useMemo(() => searchCategories(query, CATEGORIES), [query]);

  return (
    <View style={gameStyles.centerContent}>
      <Text style={gameStyles.eyebrow}>MODE CHALLENGER</Text>
      <Text style={gameStyles.prompt}>À toi de choisir ton thème, {playerName}.</Text>
      <TextInput
        style={styles.searchInput}
        value={query}
        onChangeText={setQuery}
        placeholder="Rechercher un thème (ex : star wars, chats...)"
        placeholderTextColor={colors.textMuted}
        autoCorrect={false}
        autoCapitalize="none"
        returnKeyType="search"
        clearButtonMode="while-editing"
      />
      <Text style={styles.resultCount}>
        {results.length} thème{results.length > 1 ? 's' : ''}
      </Text>
      <ScrollView style={styles.listScroll} contentContainerStyle={styles.list} keyboardShouldPersistTaps="handled">
        {results.length === 0 && <Text style={styles.emptyText}>Aucun thème ne correspond à cette recherche.</Text>}
        {results.map((c) => (
          <Pressable key={c.id} style={styles.option} onPress={() => onChoose(c.id)}>
            <Text style={styles.optionText}>{c.name}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  searchInput: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
    marginTop: 16,
  },
  resultCount: {
    color: colors.textMuted,
    fontSize: 12,
    alignSelf: 'flex-start',
    marginTop: 8,
    marginLeft: 4,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 15,
    textAlign: 'center',
    marginTop: 24,
    paddingHorizontal: 12,
  },
  listScroll: {
    width: '100%',
    maxHeight: 380,
    marginTop: 8,
  },
  list: {
    gap: 8,
    paddingBottom: 12,
  },
  option: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  optionText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
