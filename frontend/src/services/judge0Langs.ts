
export const judge0LanguageNames: Record<number, string> = {
  50: 'C',
  54: 'C++',
  62: 'Java',
  63: 'JavaScript (Node.js)',
  71: 'Python 3',
};

// Map Judge0 language IDs to Monaco Editor language identifiers
export const judge0ToMonacoLanguage: Record<number, string> = {
  50: 'c',
  54: 'cpp',
  62: 'java',
  63: 'javascript',
  71: 'python',
};

export function languageNameFromId(id: number): string {
  return judge0LanguageNames[id] || `Language ${id}`;
}

export function getMonacoLanguage(id: number): string {
  return judge0ToMonacoLanguage[id] || 'plaintext';
}
