import { Question } from '@/types';
import { revolutionFrancaiseQuestions } from './revolution-francaise';
import { systemeSolaireQuestions } from './systeme-solaire';
import { capitalesAfriqueQuestions } from './capitales-afrique';
import { biologieCellulaireQuestions } from './biologie-cellulaire';
import { empireRomainQuestions } from './empire-romain';
import { fleuvesEuropeQuestions } from './fleuves-europe';
import { elementsChimiquesQuestions } from './elements-chimiques';
import { mythologieGrecqueQuestions } from './mythologie-grecque';
import { secondeGuerreMondialeQuestions } from './seconde-guerre-mondiale';
import { dinosauresQuestions } from './dinosaures';
import { universBatmanQuestions } from './univers-batman';
import { cuisineItalienneQuestions } from './cuisine-italienne';
import { scifiAnnees80Questions } from './scifi-annees-80';
import { rapFrancaisQuestions } from './rap-francais';
import { jeuxVideo16bitsQuestions } from './jeux-video-16bits';
import { footballAnnees2000Questions } from './football-annees-2000';
import { fromagesFrancaisQuestions } from './fromages-francais';
import { starWarsQuestions } from './star-wars';
import { cocktailsClassiquesQuestions } from './cocktails-classiques';
import { seriesAnnees2010Questions } from './series-annees-2010';
import { pigeonsUrbainsQuestions } from './pigeons-urbains';
import { bruitsClavierQuestions } from './bruits-clavier';
import { ustensilesInutilisesQuestions } from './ustensiles-inutilises';
import { artLacetsQuestions } from './art-lacets';
import { culturePommeDeTerreQuestions } from './culture-pomme-de-terre';
import { phobiesEtrangesQuestions } from './phobies-etranges';
import { chosesPerduesQuestions } from './choses-perdues';
import { nainsDeJardinQuestions } from './nains-de-jardin';
import { pannesReveilQuestions } from './pannes-reveil';
import { papierToiletteQuestions } from './papier-toilette';
import { pyramidesEgypteQuestions } from './pyramides-egypte';
import { aztequesMayasQuestions } from './azteques-mayas';
import { chocolatQuestions } from './chocolat';
import { monumentsCelebresQuestions } from './monuments-celebres';

export const ALL_QUESTIONS: Question[] = [
  ...revolutionFrancaiseQuestions,
  ...systemeSolaireQuestions,
  ...capitalesAfriqueQuestions,
  ...biologieCellulaireQuestions,
  ...empireRomainQuestions,
  ...fleuvesEuropeQuestions,
  ...elementsChimiquesQuestions,
  ...mythologieGrecqueQuestions,
  ...secondeGuerreMondialeQuestions,
  ...dinosauresQuestions,
  ...universBatmanQuestions,
  ...cuisineItalienneQuestions,
  ...scifiAnnees80Questions,
  ...rapFrancaisQuestions,
  ...jeuxVideo16bitsQuestions,
  ...footballAnnees2000Questions,
  ...fromagesFrancaisQuestions,
  ...starWarsQuestions,
  ...cocktailsClassiquesQuestions,
  ...seriesAnnees2010Questions,
  ...pigeonsUrbainsQuestions,
  ...bruitsClavierQuestions,
  ...ustensilesInutilisesQuestions,
  ...artLacetsQuestions,
  ...culturePommeDeTerreQuestions,
  ...phobiesEtrangesQuestions,
  ...chosesPerduesQuestions,
  ...nainsDeJardinQuestions,
  ...pannesReveilQuestions,
  ...papierToiletteQuestions,
  ...pyramidesEgypteQuestions,
  ...aztequesMayasQuestions,
  ...chocolatQuestions,
  ...monumentsCelebresQuestions,
];

export function getQuestionsByCategory(categoryId: string): Question[] {
  return ALL_QUESTIONS.filter((q) => q.categoryId === categoryId);
}

export function getQuestionsForLevel(categoryId: string, level: number): Question[] {
  return ALL_QUESTIONS.filter((q) => q.categoryId === categoryId && q.level === level);
}
