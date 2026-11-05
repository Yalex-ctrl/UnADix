import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomActionBar } from './BottomActionBar';
import { palette, space } from '@/theme/tokens';

type BodyProps = {
  children: React.ReactNode;
  bottom?: React.ReactNode; // actions fixées en bas (bouton principal)
  center?: boolean; // centre verticalement le contenu quand il est court
  gap?: number;
};

// Corps d'un écran : le contenu défile au-dessus d'une barre d'actions fixe.
// Le clavier ne masque jamais le champ actif ni le bouton du bas.
export function ScreenBody({ children, bottom, center, gap = space.lg }: BodyProps) {
  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={[styles.content, { gap }, center && styles.center]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
      {bottom ? <BottomActionBar>{bottom}</BottomActionBar> : null}
    </KeyboardAvoidingView>
  );
}

type ScreenProps = BodyProps & {
  header?: React.ReactNode;
};

// Écran complet : zone sûre du haut, en-tête optionnel, puis le corps.
export function Screen({ header, ...body }: ScreenProps) {
  return (
    <View style={styles.root}>
      <SafeAreaView edges={['top']} style={styles.top}>
        {header}
      </SafeAreaView>
      <ScreenBody {...body} />
    </View>
  );
}

// Cadre d'un écran de jeu : en-tête fixe en haut, puis une zone où les phases
// gèrent elles-mêmes leur défilement et leur barre d'actions.
export function Frame({ header, children }: { header?: React.ReactNode; children: React.ReactNode }) {
  return (
    <View style={styles.root}>
      <SafeAreaView edges={['top']} style={styles.top}>
        {header}
      </SafeAreaView>
      <View style={styles.flex}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.bg },
  top: { backgroundColor: palette.bg },
  flex: { flex: 1 },
  content: { flexGrow: 1, paddingHorizontal: space.lg, paddingTop: space.lg, paddingBottom: space.xl },
  center: { justifyContent: 'center' },
});
