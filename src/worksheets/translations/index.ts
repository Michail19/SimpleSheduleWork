import en from './en';
import ru from './ru';

export const translations = {
    ru,
    en,
};

export type Language = keyof typeof translations;
export type TranslationKey = keyof typeof ru;
