import translations from '../../../translations/ru';

export const parseWeekRange = (weekRange: string, currentTranslation: any): { start: Date; end: Date } | null => {
    const match = weekRange.match(/(\d+)-(\d+)\s+(\S+)\s+(\d{4})/);
    if (!match) return null;

    const [, startDay, endDay, monthName, year] = match;

    // Найдем ключ месяца в переводах
    const monthKey = Object.keys(currentTranslation).find(key => currentTranslation[key] === monthName);
    if (!monthKey) return null;

    const monthIndex = Object.keys(translations).indexOf(monthKey) - 7; // -7, т.к. первые 7 ключей - дни недели
    if (monthIndex < 0) return null;

    const startDate = new Date(parseInt(year, 10), monthIndex, parseInt(startDay, 10));
    const endDate = new Date(parseInt(year, 10), monthIndex, parseInt(endDay, 10));

    return { start: startDate, end: endDate };
};

export const formatWeekRange = (start: Date, end: Date, currentTranslation: any): string => {
    const monthKey = Object.keys(translations)[start.getMonth() + 7]; // +7, т.к. первые 7 ключей - дни недели
    const monthName = currentTranslation[monthKey];

    return `${start.getDate()}-${end.getDate()} ${monthName} ${start.getFullYear()}`;
};

export const translateMonth = (weekString: string, currentTranslation: any): string => {
    const match = weekString.match(/\b(january|february|march|april|may|june|july|august|september|october|november|december)\b/i);
    if (!match) return weekString; // Если месяц не найден, вернуть строку как есть

    const englishMonth = match[0].toLowerCase(); // Найденный месяц
    const translatedMonth = currentTranslation[englishMonth] || englishMonth; // Перевод или оригинал

    return weekString.replace(new RegExp(englishMonth, "i"), translatedMonth); // Заменяем в строке
};
