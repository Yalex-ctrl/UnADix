import { Category } from '@/types';

function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

function isSubsequence(query: string, text: string): boolean {
  let i = 0;
  for (let j = 0; j < text.length && i < query.length; j++) {
    if (text[j] === query[i]) i++;
  }
  return i === query.length;
}

function scoreMatch(query: string, text: string): number {
  const q = normalize(query);
  const t = normalize(text);
  if (!q || !t) return 0;
  if (t === q) return 100;
  if (t.startsWith(q)) return 90;
  if (t.split(/\s+/).some((word) => word.startsWith(q))) return 80;
  if (t.includes(q)) return 70;
  if (isSubsequence(q, t)) return 40;
  return 0;
}

/**
 * Recherche floue et insensible aux accents parmi les thèmes : correspondance
 * exacte > préfixe > mot commençant par la requête > sous-chaîne > sous-séquence.
 * Cherche dans le nom, l'id (mots séparés) et la description courte.
 */
export function searchCategories(query: string, categories: Category[]): Category[] {
  const q = query.trim();
  if (!q) return categories;

  const scored = categories.map((category, index) => {
    const idAsWords = category.id.replace(/-/g, ' ');
    const score = Math.max(
      scoreMatch(q, category.name),
      scoreMatch(q, idAsWords) * 0.9,
      scoreMatch(q, category.shortDescription) * 0.5
    );
    return { category, score, index };
  });

  return scored
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map((entry) => entry.category);
}
