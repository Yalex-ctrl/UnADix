import { useRouter } from 'expo-router';
import { Card } from '@/components/ui/Card';
import { Header } from '@/components/ui/Header';
import { Screen } from '@/components/ui/Screen';
import { T } from '@/components/ui/Typography';
import { palette, fonts } from '@/theme/tokens';

const RULES = [
  {
    title: '1. Le principe',
    body: 'Un seul téléphone sert de présentateur. À chaque manche, un thème est annoncé et chaque joueur choisit un niveau de difficulté de 1 à 10.',
  },
  {
    title: '2. La difficulté paye',
    body: 'Plus le niveau choisi est élevé, plus la question est difficile… et plus elle rapporte : une bonne réponse au niveau 7 vaut 7 points.',
  },
  {
    title: '3. Un niveau par joueur',
    body: 'Deux joueurs ne peuvent pas prendre le même niveau dans une manche. L’ordre de choix change à chaque manche.',
  },
  {
    title: '4. Validation à voix haute',
    body: 'Le joueur répond à voix haute. L’organisateur affiche la réponse, puis valide : juste, faux, ou « accepter quand même » si la réponse était proche.',
  },
  {
    title: '5. Le joker',
    body: 'Chaque joueur a un joker par partie : il remplace sa question par une autre du même thème et du même niveau.',
  },
  {
    title: '6. Mode Voleur',
    body: 'Après une mauvaise réponse, les autres peuvent tenter de voler les points : +niveau s’ils trouvent, −2 points s’ils se trompent. La réponse n’est révélée qu’à la fin des tentatives.',
  },
  {
    title: '7. Bonus, All-In et Killer Question',
    body: 'Après les manches 3, 6 et 9, une question bonus vaut 10 points. Un duel All-In permet de miser tous ses points. En cas d’égalité, une Killer Question départage.',
  },
  {
    title: '8. Mode Challenger',
    body: 'À la fin de la partie, prolongez de 1 à 5 manches : chacun choisit son thème et le niveau (5 à 10) est tiré au sort.',
  },
];

export default function HowToPlayScreen() {
  const router = useRouter();
  return (
    <Screen header={<Header title="Comment jouer ?" onBack={() => router.back()} />} gap={12}>
      {RULES.map((rule) => (
        <Card key={rule.title} style={{ gap: 6 }}>
          <T variant="body" color={palette.primary} style={{ fontFamily: fonts.bold }}>
            {rule.title}
          </T>
          <T variant="body" color={palette.textMuted}>
            {rule.body}
          </T>
        </Card>
      ))}
    </Screen>
  );
}
