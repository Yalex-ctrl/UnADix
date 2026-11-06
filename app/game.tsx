import { useEffect, useState } from 'react';
import { Alert, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { BreakingBanner } from '@/components/ui/BreakingBanner';
import { Confetti } from '@/components/ui/Confetti';
import { Header } from '@/components/ui/Header';
import { HostBubble, moodForCommentary } from '@/components/ui/HostBubble';
import { Frame, Screen } from '@/components/ui/Screen';
import { ScoreBar } from '@/components/ui/ScoreBar';
import { SwitchRow } from '@/components/ui/SwitchRow';
import { T } from '@/components/ui/Typography';
import { TrophyQueue } from '@/components/ui/TrophyQueue';
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
import { playSound, setSoundEnabled, soundEnabled } from '@/lib/sounds';
import { palette } from '@/theme/tokens';
import { Judgement } from '@/types';

const SUMMARY_PHASES = ['round-summary', 'challenge-round-summary'];

export default function GameScreen() {
  const router = useRouter();
  const g = useGame();
  const { state } = g;
  const { flash, overlay } = useScreenFlash();
  const [menu, setMenu] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [haptics, setHaptics] = useState(hapticsEnabled());
  const [sound, setSound] = useState(soundEnabled());
  const [burst, setBurst] = useState(0); // confettis après une bonne réponse
  const [braquageTick, setBraquageTick] = useState(0);

  useEffect(() => {
    if (burst === 0) return;
    const t = setTimeout(() => setBurst(0), 2200);
    return () => clearTimeout(t);
  }, [burst]);

  if (state.phase === 'idle') {
    return (
      <Screen center bottom={<Button label="Retour à l’accueil" size="l" onPress={() => router.replace('/')} />}>
        <T variant="body" center color={palette.inkSoft}>
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
  const takenBy: Record<number, { name: string; color: string; profileId?: string }> = {};
  for (const [id, lvl] of Object.entries(state.levelChoices)) {
    const p = state.players.find((x) => x.id === id);
    if (p) takenBy[lvl] = { name: p.name, color: p.color, profileId: p.profileId };
  }
  const contenders = (ids: string[]) =>
    ids.map((id) => {
      const p = state.players.find((x) => x.id === id);
      return { id, name: p?.name ?? '', color: p?.color ?? palette.brand };
    });
  const nameOf = (id: string) => state.players.find((p) => p.id === id)?.name ?? '';

  const inSummary = SUMMARY_PHASES.includes(state.phase);
  const inFinal = state.phase === 'final-results' || state.phase === 'challenge-final-results';
  const headerTitle = isChallenge ? `Défi ${state.challengeRound} / ${state.challengeTotal}` : `Manche ${state.round} / ${state.totalRounds}`;
  const progress = isChallenge
    ? { current: state.challengeRound, total: state.challengeTotal }
    : { current: state.round, total: state.totalRounds };
  const showTrophies = state.newTrophies.length > 0 && (inSummary || inFinal);
  const lastCommentaryId = state.usedCommentaryIds[state.usedCommentaryIds.length - 1];

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
      state.players.map((p) => ({ name: p.name, profileId: p.profileId, color: p.color })),
      state.totalRounds,
      state.connectionMode,
      { thiefMode: state.thiefModeEnabled, tvHost: state.tvHost }
    );

  // Retour sensoriel du verdict : son, vibration (dans Button), flash, confettis.
  const verdict = (j: Judgement) => {
    if (j === 'incorrect') {
      playSound('wrong');
      flash(palette.bad);
    } else {
      playSound('correct');
      setBurst((b) => b + 1);
    }
  };
  const judge = (j: Judgement) => {
    verdict(j);
    g.judge(j);
  };
  const thiefJudge = (j: Judgement) => {
    verdict(j);
    g.thiefJudge(j);
  };

  const killerCopy = (() => {
    const k = state.killer;
    if (!k) return null;
    if (k.context === 'allin') {
      return {
        icon: 'zap' as const,
        kicker: 'Duel All-In',
        title: `${nameOf(k.contenders[0])} contre ${nameOf(k.contenders[1])}`,
        rule: `Mise : ${k.stake} points. Même question pour les deux : le gagnant ramasse la mise.`,
        color: '#9B1BFF',
        ink: '#FFFFFF',
      };
    }
    if (k.context === 'final') {
      return {
        icon: 'target' as const,
        kicker: 'Killer Question',
        title: 'Égalité en tête !',
        rule: 'Seuls les joueurs à égalité répondent. On continue jusqu’à un vainqueur unique.',
        color: palette.bad,
        ink: '#FFFFFF',
      };
    }
    return {
      icon: 'target' as const,
      kicker: 'Killer Question',
      title: 'Plusieurs bonnes réponses',
      rule: 'Cette question départage uniquement les joueurs concernés. Le gagnant remporte les 10 points.',
      color: palette.bad,
      ink: '#FFFFFF',
    };
  })();

  return (
    <Frame
      header={
        <>
          <Header title={headerTitle} progress={progress} onUndo={g.undo} undoDisabled={!state.prevState} onMenu={() => setMenu(true)} />
          <ScoreBar players={state.players} activeId={activePlayerId(state)} />
          {(inSummary || inFinal) && state.tvHost && <HostBubble text={state.commentary} mood={moodForCommentary(lastCommentaryId)} />}
        </>
      }
    >
      <View style={{ flex: 1 }}>
        {state.phase === 'round-intro' && category && (
          <RoundIntro
            key={`intro-${state.round}`}
            round={state.round}
            total={state.totalRounds}
            categoryId={category.id}
            categoryDescription={category.shortDescription}
            isAuctionRound={state.auctionRounds.includes(state.round)}
            onStart={g.beginLevelSelect}
          />
        )}

        {state.phase === 'level-select' && targetPlayer && (
          <LevelSelect player={targetPlayer} takenBy={takenBy} onChoose={(level) => g.chooseLevel(targetPlayerId, level)} />
        )}

        {state.phase === 'auction-bid' && (
          <AuctionBid categoryName={isChallenge ? undefined : category?.name} players={state.players} onResolve={g.resolveAuction} />
        )}

        {state.phase === 'challenge-category-select' && targetPlayer && (
          <ChallengeCategorySelect player={targetPlayer} onChoose={(categoryId) => g.chooseChallengeCategory(targetPlayerId, categoryId)} />
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
              setBraquageTick((n) => n + 1);
              flash(palette.bad);
            }}
          />
        )}

        {state.phase === 'answer-reveal' && state.currentQuestion && (
          <AnswerReveal
            questionText={state.currentQuestion.question}
            context={answerContext}
            question={state.currentQuestion}
            secret={state.thiefModeEnabled && !state.braquage && !state.auctionWinnerId}
            onJudge={judge}
          />
        )}

        {state.phase === 'thief-offer' && (
          <ThiefOffer victim={targetPlayer} level={activeLevel} candidates={state.players.filter((p) => p.id !== targetPlayerId)} onStart={g.startThief} />
        )}

        {state.phase === 'thief-attempt' && state.currentQuestion && thief && (
          <ThiefAttempt
            key={thief.id}
            thief={thief}
            level={activeLevel}
            remaining={state.thiefCandidates.length}
            question={state.currentQuestion}
            onJudge={thiefJudge}
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
            color={palette.gold}
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
            color={killerCopy.color}
            ink={killerCopy.ink}
            question={state.killer.question}
            contenders={contenders(state.killer.contenders)}
            onSubmit={g.resolveKiller}
          />
        )}

        {state.phase === 'final-results' && (
          <FinalResults
            players={state.players}
            winnerId={state.finalWinnerId}
            commentary={null}
            onReplay={replaySamePlayers}
            onHome={goHome}
            onStartChallenge={g.startChallenge}
          />
        )}

        {state.phase === 'challenge-final-results' && (
          <ChallengeFinalResults players={state.players} winnerId={state.finalWinnerId} commentary={null} onReplay={replaySamePlayers} onHome={goHome} />
        )}
      </View>

      {burst > 0 && !inFinal && <Confetti key={burst} count={30} />}
      <BreakingBanner text="BRAQUAGE !" trigger={braquageTick} />

      {showTrophies && <TrophyQueue key={state.newTrophies.length} events={state.newTrophies} players={state.players} onDone={g.ackTrophies} />}

      <BottomSheet
        visible={menu}
        title="Menu de la partie"
        onClose={() => {
          setMenu(false);
          setRemoving(false);
        }}
      >
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
            {state.phase === 'question' && (
              <Button
                label="Signaler la question"
                icon="flag"
                variant="secondary"
                onPress={() => {
                  setMenu(false);
                  report();
                }}
              />
            )}
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
            <SwitchRow
              title="Sons"
              description="Effets sonores courts (coupés si le téléphone est en silencieux)."
              value={sound}
              onValueChange={(v) => {
                setSound(v);
                setSoundEnabled(v);
              }}
            />
            <Button
              label="Quitter la partie"
              icon="log-out"
              variant="bad"
              onPress={() => {
                setMenu(false);
                quit();
              }}
            />
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
