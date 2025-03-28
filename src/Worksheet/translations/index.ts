import en from './en';
import ru from './ru';
import {Language} from "../types";

export const translations: Record<Language, { [key: string]: string }> = {
    ru,
    en,
};
