import { View, Text, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, PLAYER_COLORS } from '@/constants/theme';
import { useGame } from '@/context/GameContext';
import { useScreenFlash } from '@/components/ui/ScreenFlash';
import { Button } from '@/components/ui/Button';
import { ScoreStrip } from '@/components/game/ScoreStrip';
import { RoundIntro } from '@/components/game/phases/RoundIntro';
import { LevelSelect } from '@/components/game/phases/LevelSelect';
import { AuctionBid } from '@/components/game/phases/AuctionBid';
import { ChallengeCategorySelect } from '@/components/game/phases/ChallengeCategorySelect';
import { ChallengeRoundIntro } from '@/components/game/phases/ChallengeRoundIntro';
import { QuestionView } from '@/components/game/phases/QuestionView';
import { AnswerReveal } from '@/components/game/phases/AnswerReveal';
import { ThiefOffer } from '@/components/game/phases/ThiefOffer';
import { ThiefAttempt } from '@/components/game/phases/ThiefAttempt';
import { ThiefReveal } from '@/components/game/phases/ThiefReveal';
import { RoundSummary } from '@/components/game/phases/RoundSummary';
import { ChallengeRoundSummary } from '@/components/game/phases/ChallengeRoundSummary';
import { FinalResults } from '@/components/game/phases/FinalResults';
import { ChallengeFinalResults } from '@/components/game/phases/ChallengeFinalResults';
import { MultiJudge } from '@/components/game/phases/MultiJudge';
import { AllInSetup } from '@/components/game/phases/AllInSetup';

export default function GameScreen() {
  const router = useRouter();
  const {
    state,
    beginLevelSelect,
    chooseLevel,
    revealAnswer,
    judge,
    beginBraquage,
    startThief,
    thiefJudge,
    skipThief,
    continueAfterSteal,
    resolveAuction,
    nextRound,
    startChallenge,
    chooseChallengeCategory,
    beginChallengeRound,
    nextChallengeRound,
    playJoker,
    replaceQuestion,
    resolveBonus,
    resolveKiller,
    openAllIn,
    startAllIn,
    cancelAllIn,
    removePlayer,
    undo,
    reset,
    currentCategory,
    currentPlayer,
    currentPlayerCategory,
  } = useGame();
  const { flash, overlay } = useScreenFlash();

  if (state.phase === 'idle') {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.emptyText}>Aucune partie en cours.</Text>
        <Button label="Retour à l'accueil" onPress={() => router.replace('/')} style={styles.emptyButton} />
      </SafeAreaView>
    );
  }

  const isChallenge = state.mode === 'challenge';
  const category = currentCategory();
  const activeCategoryName = isChallenge ? currentPlayerCategory()?.name ?? '' : category?.name ?? '';
  const targetPlayerId = state.turnOrder[state.currentTurnIndex];
  const targetPlayer = state.players.find((p) => p.id === targetPlayerId);
  const activeLevel = state.auctionWinnerId
    ? state.auctionLevel ?? 0
    : isChallenge
    ? state.challengeLevels[state.challengeRound - 1]
    : state.levelChoices[targetPlayerId];

  const eligibleBraqueurs = state.players.filter(
    (p) => p.id !== targetPlayerId && !state.braqueursUsed.includes(p.id)
  );
  const braquageInfo = state.braquage
    ? {
        braqueurName: state.players.find((p) => p.id === state.braquage!.braqueurId)?.name ?? '',
        victimName: state.players.find((p) => p.id === state.braquage!.targetId)?.name ?? '',
      }
    : null;

  const answeringLabel = state.braquage
    ? `🔴 ${braquageInfo?.braqueurName} braque ${braquageInfo?.victimName}`
    : state.auctionWinnerId
    ? `💰 ${currentPlayer()?.name ?? ''} (enchère gagnée)`
    : currentPlayer()?.name ?? '';

  const thiefId = state.thiefCandidates[0];
  const thiefName = state.players.find((p) => p.id === thiefId)?.name ?? '';
  const colorOf = (id: string) => state.players.find((p) => p.id === id)?.color ?? PLAYER_COLORS[0];
  const killerContenders = (state.killer?.contenders ?? []).map((id) => ({
    id,
    name: state.players.find((p) => p.id === id)?.name ?? '',
    color: colorOf(id),
  }));
  const nameOf = (id: string) => state.players.find((p) => p.id === id)?.name ?? '';

  const handleBraquage = (braqueurId: string) => {
    beginBraquage(braqueurId);
    flash(colors.braquage);
  };

  const handleReport = () =>
    Alert.alert('Signaler la question', 'Elle sera remplacée par une autre du même niveau, sans consommer de joker.', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Remplacer', onPress: replaceQuestion },
    ]);

  const handleQuit = () => {
    Alert.alert('Quitter la partie ?', 'La partie en cours sera perdue.', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Quitter',
        style: 'destructive',
        onPress: () => {
          reset();
          router.replace('/');
        },
      },
    ]);
  };

  const replay = () => {
    reset();
    router.replace('/');
  };

  const killerTitle =
    state.killer?.context === 'final'
      ? 'Égalité en tête : seuls les joueurs à égalité répondent.'
      : state.killer?.context === 'allin'
      ? `Mise : ${state.killer.stake} points. Les deux joueurs répondent à la même question.`
      : 'Plusieurs bonnes réponses : cette question départage les joueurs concernés.';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <Text style={styles.roundLabel}>
            {isChallenge
              ? `DÉFI ${state.challengeRound} / ${state.challengeTotal}`
              : `MANCHE ${state.round} / ${state.totalRounds}`}
          </Text>
          <View style={styles.headerButtons}>
            {state.prevState && <Button label="↩️ Annuler" variant="secondary" onPress={undo} style={styles.quitButton} />}
            <Button label="✕" variant="secondary" onPress={handleQuit} style={styles.quitButton} />
          </View>
        </View>
        <ScoreStrip players={state.players} />
      </View>

      {state.phase === 'round-intro' && category && (
        <RoundIntro
          categoryName={category.name}
          categoryDescription={category.shortDescription}
          isAuctionRound={state.auctionRounds.includes(state.round)}
          onStart={beginLevelSelect}
        />
      )}

      {state.phase === 'level-select' && (
        <LevelSelect
          playerName={currentPlayer()?.name ?? ''}
          takenLevels={Object.values(state.levelChoices)}
          onChoose={(level) => chooseLevel(targetPlayerId, level)}
        />
      )}

      {state.phase === 'auction-bid' && (
        <AuctionBid
          categoryName={isChallenge ? undefined : category?.name}
          players={state.players}
          onResolve={resolveAuction}
        />
      )}

      {state.phase === 'challenge-category-select' && (
        <ChallengeCategorySelect
          playerName={currentPlayer()?.name ?? ''}
          onChoose={(categoryId) => chooseChallengeCategory(targetPlayerId, categoryId)}
        />
      )}

      {state.phase === 'challenge-round-intro' && (
        <ChallengeRoundIntro
          round={state.challengeRound}
          total={state.challengeTotal}
          level={state.challengeLevels[state.challengeRound - 1]}
          isAuctionRound={state.challengeAuctionRound === state.challengeRound}
          onStart={beginChallengeRound}
        />
      )}

      {state.phase === 'question' && activeCategoryName && state.currentQuestion && (
        <QuestionView
          categoryName={activeCategoryName}
          level={activeLevel}
          playerName={currentPlayer()?.name ?? ''}
          questionText={state.currentQuestion.question}
          braquage={braquageInfo}
          isAuction={!!state.auctionWinnerId}
          eligibleBraqueurs={eligibleBraqueurs}
          connectionMode={state.connectionMode}
          jokerAvailable={!targetPlayer?.jokerUsed}
          onJoker={() => {
            playJoker();
            flash(colors.joker);
          }}
          onReport={handleReport}
          onReveal={revealAnswer}
          onBraquage={handleBraquage}
        />
      )}

      {state.phase === 'answer-reveal' && state.currentQuestion && (
        <AnswerReveal
          answeringLabel={answeringLabel}
          question={state.currentQuestion}
          secret={state.thiefModeEnabled && !state.braquage && !state.auctionWinnerId}
          onJudge={judge}
        />
      )}

      {state.phase === 'thief-offer' && (
        <ThiefOffer
          victimName={targetPlayer?.name ?? ''}
          level={activeLevel}
          candidates={state.players.filter((p) => p.id !== targetPlayerId)}
          onStart={startThief}
        />
      )}

      {state.phase === 'thief-attempt' && state.currentQuestion && (
        <ThiefAttempt
          thiefName={thiefName}
          level={activeLevel}
          remaining={state.thiefCandidates.length}
          question={state.currentQuestion}
          onJudge={thiefJudge}
          onSkip={skipThief}
        />
      )}

      {state.phase === 'thief-reveal' && state.currentQuestion && (
        <ThiefReveal question={state.currentQuestion} onContinue={continueAfterSteal} />
      )}

      {state.phase === 'round-summary' && (
        <RoundSummary
          players={state.players}
          commentary={state.commentary}
          newTrophies={state.newTrophies}
          isLastRound={state.round >= state.totalRounds && (state.round % 3 !== 0 || state.bonusDoneRound === state.round)}
          onNext={nextRound}
          onAllIn={openAllIn}
          onRemovePlayer={removePlayer}
        />
      )}

      {state.phase === 'challenge-round-summary' && (
        <ChallengeRoundSummary
          players={state.players}
          commentary={state.commentary}
          newTrophies={state.newTrophies}
          isLastRound={state.challengeRound >= state.challengeTotal}
          onNext={nextChallengeRound}
          onAllIn={openAllIn}
          onRemovePlayer={removePlayer}
        />
      )}

      {state.phase === 'bonus-question' && (
        <MultiJudge
          eyebrow="QUESTION BONUS — 10 POINTS"
          title="Une question très difficile pour tous"
          subtitle="Tout le monde répond, puis la réponse est révélée."
          question={state.bonusQuestion}
          contenders={state.players}
          submitLabel="Valider"
          onSubmit={resolveBonus}
        />
      )}

      {state.phase === 'allin-setup' && (
        <AllInSetup players={state.players} onStart={startAllIn} onCancel={cancelAllIn} />
      )}

      {state.phase === 'killer' && state.killer && (
        <MultiJudge
          eyebrow={state.killer.context === 'allin' ? '🎲 DUEL ALL-IN' : '⚔️ KILLER QUESTION'}
          title={state.killer.context === 'allin' ? `${nameOf(state.killer.contenders[0])} vs ${nameOf(state.killer.contenders[1])}` : undefined}
          subtitle={killerTitle}
          accent={colors.braquage}
          question={state.killer.question}
          contenders={killerContenders}
          submitLabel="Valider"
          onSubmit={resolveKiller}
        />
      )}

      {state.phase === 'final-results' && (
        <FinalResults
          players={state.players}
          winnerId={state.finalWinnerId}
          commentary={state.commentary}
          onReplay={replay}
          onStartChallenge={startChallenge}
        />
      )}

      {state.phase === 'challenge-final-results' && (
        <ChallengeFinalResults
          players={state.players}
          winnerId={state.finalWinnerId}
          commentary={state.commentary}
          onReplay={replay}
        />
      )}

      {overlay}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 20,
  },
  header: {
    paddingTop: 8,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  roundLabel: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
  },
  quitButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 100,
  },
  emptyButton: {
    marginHorizontal: 24,
    marginTop: 16,
  },
});
