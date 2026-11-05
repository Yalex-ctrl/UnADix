import { useState } from 'react';
import { Alert, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Header } from '@/components/ui/Header';
import { Frame, Screen } from '@/components/ui/Screen';
import { ScoreBar } from '@/components/ui/ScoreBar';
import { SwitchRow } from '@/components/ui/SwitchRow';
import { T } from '@/components/ui/Typography';
import { TrophyQueue } from '@/components/ui/TrophyQueue';
import { TvBubble } from '@/components/ui/TvBubble';
import { useScreenFlash } from '@/components/ui/ScreenFlash';
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
import { useGame } from '@/context/GameContext';
import { activePlayerId, canAllIn } from '@/lib/gameReducer';
import { hapticsEnabled, setHapticsEnabled } from '@/lib/haptics';
import { palette } from '@/theme/tokens';

const SUMMARY_PHASES = ['round-summary', 'challenge-round-summary'];

export default function GameScreen() {
  const router = useRouter();
  const g = useGame();
  const { state } = g;
  const { flash, overlay } = useScreenFlash();
  const [menu, setMenu] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [haptics, setHaptics] = useState(hapticsEnabled());

  if (state.phase === 'idle') {
    return (
      <Screen center bottom={<Button label="Retour à l’accueil" size="l" onPress={() => router.replace('/')} />}>
        <T variant="body" center color={palette.textMuted}>
          Aucune partie en cours.
        </T>
      </Screen>
    );
  }

  const isChallenge = state.mode === 'challenge';
  const category = g.currentCategory();
  const activeCategoryName = isChallenge ? g.currentPlayerCategory()?.name ?? '' : category?.name ?? '';
  const targetPlayerId = state.turnOrder[state.currentTurnIndex];
  const targetPlayer = state.players.find((p) => p.id === targetPlayerId);
  const activeLevel = state.auctionWinnerId
    ? state.auctionLevel ?? 0
    : isChallenge
    ? state.challengeLevels[state.challengeRound - 1]
    : state.levelChoices[targetPlayerId];

  const eligibleBraqueurs = state.players.filter((p) => p.id !== targetPlayerId && !state.braqueursUsed.includes(p.id));
  const braquageInfo = state.braquage
    ? {
        braqueurName: state.players.find((p) => p.id === state.braquage!.braqueurId)?.name ?? '',
        victimName: state.players.find((p) => p.id === state.braquage!.targetId)?.name ?? '',
      }
    : null;

  const answerer = g.currentPlayer();
  const answerContext = state.braquage
    ? `Question braquée par ${braquageInfo?.braqueurName} · Niveau ${activeLevel} · ${activeLevel} pts`
    : `Question ${answerer?.name ? `de ${answerer.name}` : ''} · Niveau ${activeLevel} · ${activeLevel} pts`;

  const thief = state.players.find((p) => p.id === state.thiefCandidates[0]);
  const takenBy: Record<number, { name: string; color: string }> = {};
  for (const [id, lvl] of Object.entries(state.levelChoices)) {
    const p = state.players.find((x) => x.id === id);
    if (p) takenBy[lvl] = { name: p.name, color: p.color };
  }
  const contenders = (ids: string[]) =>
    ids.map((id) => {
      const p = state.players.find((x) => x.id === id);
      return { id, name: p?.name ?? '', color: p?.color ?? palette.primary };
    });
  const nameOf = (id: string) => state.players.find((p) => p.id === id)?.name ?? '';

  const inSummary = SUMMARY_PHASES.includes(state.phase);
  const inFinal = state.phase === 'final-results' || state.phase === 'challenge-final-results';
  const headerTitle = isChallenge ? `Défi ${state.challengeRound} / ${state.challengeTotal}` : `Manche ${state.round} / ${state.totalRounds}`;
  const showTrophies = state.newTrophies.length > 0 && (inSummary || inFinal);

  const quit = () =>
    Alert.alert('Quitter la partie ?', 'La partie en cours sera perdue.', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Quitter',
        style: 'destructive',
        onPress: () => {
          g.reset();
          router.replace('/');
        },
      },
    ]);

  const report = () =>
    Alert.alert('Signaler la question', 'Elle sera remplacée par une autre du même niveau, sans consommer de joker.', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Remplacer', onPress: g.replaceQuestion },
    ]);

  const confirmRemove = (id: string) =>
    Alert.alert(`Retirer ${nameOf(id)} ?`, 'Le joueur quitte la partie et le classement est recalculé.', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Retirer',
        style: 'destructive',
        onPress: () => {
          g.removePlayer(id);
          setMenu(false);
          setRemoving(false);
        },
      },
    ]);

  const goHome = () => {
    g.reset();
    router.replace('/');
  };

  const replaySamePlayers = () =>
    g.startGame(
      state.players.map((p) => ({ name: p.name })),
      state.totalRounds,
      state.connectionMode,
      { thiefMode: state.thiefModeEnabled, tvHost: state.tvHost }
    );

  const killerCopy = (() => {
    const k = state.killer;
    if (!k) return null;
    if (k.context === 'allin') {
      return {
        icon: 'zap' as const,
        kicker: 'Duel All-In',
        title: `${nameOf(k.contenders[0])} contre ${nameOf(k.contenders[1])}`,
        rule: `Mise : ${k.stake} points. Même question pour les deux : le gagnant ramasse la mise.`,
      };
    }
    if (k.context === 'final') {
      return {
        icon: 'target' as const,
        kicker: 'Killer Question',
        title: 'Égalité en tête !',
        rule: 'Seuls les joueurs à égalité répondent. On continue jusqu’à un vainqueur unique.',
      };
    }
    return {
      icon: 'target' as const,
      kicker: 'Killer Question',
      title: 'Plusieurs bonnes réponses',
      rule: 'Cette question départage uniquement les joueurs concernés. Le gagnant remporte les 10 points.',
    };
  })();

  return (
    <Frame
      header={
        <>
          <Header
            title={headerTitle}
            onUndo={g.undo}
            undoDisabled={!state.prevState}
            onMenu={() => setMenu(true)}
            onClose={quit}
          />
          <ScoreBar players={state.players} activeId={activePlayerId(state)} />
          {(inSummary || inFinal) && state.tvHost && <TvBubble text={state.commentary} />}
        </>
      }
    >
      <PhaseHost>
        {state.phase === 'round-intro' && category && (
          <RoundIntro
            round={state.round}
            total={state.totalRounds}
            categoryName={category.name}
            categoryDescription={category.shortDescription}
            isAuctionRound={state.auctionRounds.includes(state.round)}
            onStart={g.beginLevelSelect}
          />
        )}

        {state.phase === 'level-select' && targetPlayer && (
          <LevelSelect
            player={targetPlayer}
            takenBy={takenBy}
            onChoose={(level) => g.chooseLevel(targetPlayerId, level)}
          />
        )}

        {state.phase === 'auction-bid' && (
          <AuctionBid
            categoryName={isChallenge ? undefined : category?.name}
            players={state.players}
            onResolve={g.resolveAuction}
          />
        )}

        {state.phase === 'challenge-category-select' && targetPlayer && (
          <ChallengeCategorySelect
            player={targetPlayer}
            onChoose={(categoryId) => g.chooseChallengeCategory(targetPlayerId, categoryId)}
          />
        )}

        {state.phase === 'challenge-round-intro' && (
          <ChallengeRoundIntro
            round={state.challengeRound}
            total={state.challengeTotal}
            level={state.challengeLevels[state.challengeRound - 1]}
            isAuctionRound={state.challengeAuctionRound === state.challengeRound}
            onStart={g.beginChallengeRound}
          />
        )}

        {state.phase === 'question' && activeCategoryName && state.currentQuestion && answerer && (
          <QuestionView
            categoryName={activeCategoryName}
            level={activeLevel}
            player={state.auctionWinnerId ? answerer : targetPlayer ?? answerer}
            questionText={state.currentQuestion.question}
            braquage={braquageInfo}
            isAuction={!!state.auctionWinnerId}
            eligibleBraqueurs={eligibleBraqueurs}
            jokerAvailable={!targetPlayer?.jokerUsed}
            onJoker={() => g.playJoker()}
            onReport={report}
            onReveal={g.revealAnswer}
            onBraquage={(id) => {
              g.beginBraquage(id);
              flash(palette.danger);
            }}
          />
        )}

        {state.phase === 'answer-reveal' && state.currentQuestion && (
          <AnswerReveal
            context={answerContext}
            question={state.currentQuestion}
            secret={state.thiefModeEnabled && !state.braquage && !state.auctionWinnerId}
            onJudge={g.judge}
          />
        )}

        {state.phase === 'thief-offer' && (
          <ThiefOffer
            victimName={targetPlayer?.name ?? ''}
            level={activeLevel}
            candidates={state.players.filter((p) => p.id !== targetPlayerId)}
            onStart={g.startThief}
          />
        )}

        {state.phase === 'thief-attempt' && state.currentQuestion && thief && (
          <ThiefAttempt
            thief={thief}
            level={activeLevel}
            remaining={state.thiefCandidates.length}
            question={state.currentQuestion}
            onJudge={g.thiefJudge}
            onSkip={g.skipThief}
          />
        )}

        {state.phase === 'thief-reveal' && state.currentQuestion && (
          <ThiefReveal question={state.currentQuestion} onContinue={g.continueAfterSteal} />
        )}

        {state.phase === 'round-summary' && (
          <RoundSummary
            players={state.players}
            deltas={state.rankDeltas}
            isLastRound={state.round >= state.totalRounds && (state.round % 3 !== 0 || state.bonusDoneRound === state.round)}
            allInPossible={canAllIn(state.players)}
            onNext={g.nextRound}
            onAllIn={g.openAllIn}
          />
        )}

        {state.phase === 'challenge-round-summary' && (
          <ChallengeRoundSummary
            players={state.players}
            deltas={state.rankDeltas}
            isLastRound={state.challengeRound >= state.challengeTotal}
            allInPossible={canAllIn(state.players)}
            onNext={g.nextChallengeRound}
            onAllIn={g.openAllIn}
          />
        )}

        {state.phase === 'bonus-question' && (
          <MultiJudge
            key={`bonus-${state.round}`}
            icon="star"
            kicker="Question bonus"
            title="10 points à gagner"
            rule="Une seule question très difficile, posée à tout le monde. Plusieurs bonnes réponses : une Killer Question les départage."
            question={state.bonusQuestion}
            contenders={contenders(state.players.map((p) => p.id))}
            onSubmit={g.resolveBonus}
          />
        )}

        {state.phase === 'allin-setup' && <AllInSetup players={state.players} onStart={g.startAllIn} onCancel={g.cancelAllIn} />}

        {state.phase === 'killer' && state.killer && killerCopy && (
          <MultiJudge
            key={`killer-${state.killer.context}-${state.killer.contenders.join('-')}`}
            icon={killerCopy.icon}
            kicker={killerCopy.kicker}
            title={killerCopy.title}
            rule={killerCopy.rule}
            gold={state.killer.context !== 'final'}
            question={state.killer.question}
            contenders={contenders(state.killer.contenders)}
            onSubmit={g.resolveKiller}
          />
        )}

        {state.phase === 'final-results' && (
          <FinalResults
            players={state.players}
            winnerId={state.finalWinnerId}
            onReplay={replaySamePlayers}
            onHome={goHome}
            onStartChallenge={g.startChallenge}
          />
        )}

        {state.phase === 'challenge-final-results' && (
          <ChallengeFinalResults
            players={state.players}
            winnerId={state.finalWinnerId}
            onReplay={replaySamePlayers}
            onHome={goHome}
          />
        )}
      </PhaseHost>

      {showTrophies && <TrophyQueue key={state.newTrophies.length} events={state.newTrophies} players={state.players} onDone={g.ackTrophies} />}

      <BottomSheet visible={menu} title="Menu de la partie" onClose={() => { setMenu(false); setRemoving(false); }}>
        {!removing ? (
          <>
            <Button
              label="Règles du jeu"
              icon="book-open"
              variant="secondary"
              onPress={() => {
                setMenu(false);
                router.push('/how-to-play');
              }}
            />
            {inSummary && state.players.length > 2 && (
              <Button label="Retirer un joueur" icon="user-minus" variant="secondary" onPress={() => setRemoving(true)} />
            )}
            <SwitchRow
              title="Retours haptiques"
              description="Vibrations sur les réponses et les choix."
              value={haptics}
              onValueChange={(v) => {
                setHaptics(v);
                setHapticsEnabled(v);
              }}
            />
            <Button label="Quitter la partie" icon="log-out" variant="danger" onPress={() => { setMenu(false); quit(); }} />
          </>
        ) : (
          <>
            {state.players.map((p) => (
              <Button key={p.id} label={`Retirer ${p.name}`} variant="secondary" onPress={() => confirmRemove(p.id)} />
            ))}
            <Button label="Retour" variant="ghost" onPress={() => setRemoving(false)} />
          </>
        )}
      </BottomSheet>

      {overlay}
    </Frame>
  );
}

// Les phases fournissent leur propre ScreenBody (défilement + barre du bas).
function PhaseHost({ children }: { children: React.ReactNode }) {
  return <View style={{ flex: 1 }}>{children}</View>;
}
