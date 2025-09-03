
export const judge0LanguageNames: Record<number, string> = {
  50: 'C',
  54: 'C++',
  62: 'Java',
  63: 'JavaScript (Node.js)',
  71: 'Python 3',
 
};

export function languageNameFromId(id: number): string {
  return judge0LanguageNames[id] || `Language ${id}`;
}
