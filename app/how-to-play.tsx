import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors } from '@/constants/theme';

const RULES = [
  {
    title: '1. Le principe',
    body: "Un seul téléphone sert de présentateur. À chaque manche, une catégorie est annoncée et chaque joueur choisit un niveau de difficulté de 1 à 10.",
  },
  {
    title: '2. La difficulté paye',
    body: "Plus le niveau choisi est élevé, plus la question est difficile... et plus elle rapporte de points. Une question de niveau 7 rapporte 7 points.",
  },
  {
    title: '3. Un niveau par joueur',
    body: "Deux joueurs ne peuvent pas choisir le même niveau pendant une même manche. L'ordre de choix change à chaque manche pour rester équitable.",
  },
  {
    title: '4. Validation à voix haute',
    body: "Le joueur répond à voix haute. Le maître du jeu affiche ensuite la réponse et juge lui-même : bonne réponse, mauvaise réponse, ou accepter quand même si la réponse était proche.",
  },
  {
    title: '5. Mode Voleur',
    body: "Si activé, une mauvaise réponse permet aux autres joueurs de tenter de voler les points de la question.",
  },
  {
    title: '6. La partie',
    body: "La partie se joue en 10 manches, chacune avec une nouvelle catégorie. Le joueur avec le plus de points à la fin remporte la partie.",
  },
];

export default function HowToPlayScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Comment jouer ?</Text>
        {RULES.map((rule) => (
          <View key={rule.title} style={styles.card}>
            <Text style={styles.cardTitle}>{rule.title}</Text>
            <Text style={styles.cardBody}>{rule.body}</Text>
          </View>
        ))}
      </ScrollView>
      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>Retour</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 24,
    gap: 14,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 8,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTitle: {
    color: colors.accent,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  cardBody: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 21,
  },
  backButton: {
    marginVertical: 16,
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  backButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
});
