import {translations} from "./translations";

export const parseWeekRange = (weekRange: string, currentTranslation: any) => {
    const match = weekRange.match(/(\d+)-(\d+)\s+(\S+)\s+(\d{4})/);
    if (!match) return null;

    const [, startDay, endDay, monthName, year] = match;
    const monthKey = Object.keys(currentTranslation).find(key => currentTranslation[key] === monthName);
    if (!monthKey) return null;

    const monthIndex = Object.keys(translations.ru).indexOf(monthKey) - 7;
    if (monthIndex < 0) return null;

    const startDate = new Date(parseInt(year, 10), monthIndex, parseInt(startDay, 10));
    const endDate = new Date(parseInt(year, 10), monthIndex, parseInt(endDay, 10));

    return { start: startDate, end: endDate };
};

export const formatWeekRange = (start: Date, end: Date, currentTranslation: any) => {
    const monthKey = Object.keys(translations.ru)[start.getMonth() + 7];
    const monthName = currentTranslation[monthKey];

    return `${start.getDate()}-${end.getDate()} ${monthName} ${start.getFullYear()}`;
};

export const translateMonth = (weekString: string, currentTranslation: any) => {
    const match = weekString.match(/\b(january|february|march|april|may|june|july|august|september|october|november|december)\b/i);
    if (!match) return weekString;

    const englishMonth = match[0].toLowerCase();
    const translatedMonth = currentTranslation[englishMonth] || englishMonth;

    return weekString.replace(new RegExp(englishMonth, "i"), translatedMonth);
};
