import {translations} from "./translations";

const monthOrder = [
    'january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december'
];

export const parseWeekRange = (weekRange: string, currentTranslation: any) => {
    const match = weekRange.match(/(\d+)-(\d+)\s+(\S+)\s+(\d{4})/);
    if (!match) return null;

    const [, startDay, endDay, monthName, year] = match;
    const monthKey = Object.keys(currentTranslation).find(
        key => currentTranslation[key] === monthName
    );
    if (!monthKey) return null;

    const monthIndex = monthOrder.indexOf(monthKey);
    if (monthIndex === -1) return null;

    const startDate = new Date(parseInt(year, 10), monthIndex, parseInt(startDay, 10));
    const endDate = new Date(parseInt(year, 10), monthIndex, parseInt(endDay, 10));

    return { start: startDate, end: endDate };
};

export const formatWeekRange = (start: Date, end: Date, currentTranslation: any) => {
    const monthKey = monthOrder[start.getMonth()];
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
