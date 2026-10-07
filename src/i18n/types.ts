export type LanguageCode = 'tr' | 'en' | 'de' | 'fr' | 'ru';

export interface LanguageOption {
  code: LanguageCode;
  label: string;
  nativeName: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'tr', label: 'Türkçe', nativeName: 'Türkçe', flag: '🇹🇷' },
  { code: 'en', label: 'English', nativeName: 'English (US/UK)', flag: '🇬🇧' },
  { code: 'de', label: 'Deutsch', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', label: 'Français', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'ru', label: 'Русский', nativeName: 'Русский', flag: '🇷🇺' },
];
