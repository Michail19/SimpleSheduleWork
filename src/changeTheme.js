const translations = {
    ru: {
        loading: "Загрузка...",
        filters: "Фильтры",
        schedule: "Расписание",
        projects: "Проекты",
        home: "На главный",
        logout: "Выход",
        login: "Вход",
        work_schedule: "График работы сотрудников",
        sidebar_filters: "Фильтры",
        sidebar_search: "Поиск",
        sidebar_schedule: "Расписание",
        sidebar_projects: "Проекты",
        list_of_projects: "Список проектов"
    },
    en: {
        loading: "Loading...",
        filters: "Filters",
        schedule: "Schedule",
        projects: "Projects",
        home: "Home",
        logout: "Logout",
        login: "Login",
        work_schedule: "Employee Work Schedule",
        sidebar_filters: "Filters",
        sidebar_search: "Search",
        sidebar_schedule: "Schedule",
        sidebar_projects: "Projects",
        list_of_projects: "List of projects"
    }
};

function resetHover() {
    document.body.style.pointerEvents = "none"; // Отключаем ховеры
    setTimeout(() => {
        document.body.style.pointerEvents = "auto"; // Включаем обратно
    }, 10); // 10 мс — почти незаметно
}

let currentLang = localStorage.getItem("lang") || "ru";

function changeLanguage() {
    const preloader = document.getElementById('preloader');
    resetHover();
    preloader.classList.remove('hidden');

    // Меняем язык
    currentLang = currentLang === "ru" ? "en" : "ru";
    localStorage.setItem("lang", currentLang);

    // Отправляем событие с `detail`
    window.dispatchEvent(new CustomEvent("languageUpdateEvent", { detail: currentLang }));

    // Обновляем текст
    updateText();

    setTimeout(() => {
        preloader.classList.add('hidden');
    }, 500);
}

function updateText() {
    document.querySelectorAll("[data-key]").forEach((el) => {
        const key = el.getAttribute("data-key");
        el.textContent = translations[currentLang][key];
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.querySelector('.header__up-blocks__wrapper__list__theme-toggle');
    const langToggle = document.querySelector('.header__up-blocks__wrapper__list__theme-toggle_lang');
    const button = document.querySelector('.btn_worksheet');
    const content = document.querySelector('.content');
    const subtitle_date = document.querySelector('.subtitle__date');
    const footer = document.querySelector('.footer');
    const authToken = localStorage.getItem('authToken');

    // Проверяем, первый ли это запуск
    const isFirstLaunch = localStorage.getItem('first_launch') === null;

    if (isFirstLaunch) {
        // Устанавливаем флаг, что первый запуск уже был
        localStorage.setItem('first_launch', 'done');
    } else {
        // Восстанавливаем тему
        if (localStorage.getItem('dark_theme') === 'enabled') {
            document.body.classList.add('dark-theme');
        }

        // Восстанавливаем язык
        if (localStorage.getItem('changed-lang') === 'enabled') {
            document.body.classList.add('changed-lang');
            updateText();
        }

        // Восстанавливаем состояние скрытых элементов
        if (content && subtitle_date && button && footer) {
            if (localStorage.getItem('btn_state') === 'hidden') {
                content.classList.add('hide_content');
                subtitle_date.classList.add('hide_content');
                button.classList.toggle('btn_worksheet_enable');
                footer.classList.add('hide_content');
            } else {
                button.classList.add('btn_worksheet_enable');
            }
        }
    }

    // Проверяем тему браузера
    const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (isDarkMode) {
        document.body.classList.add('dark-theme');
    }

    // Обработчик для переключения темы
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
        if (document.body.classList.contains('dark-theme')) {
            localStorage.setItem('dark_theme', 'enabled');
        } else {
            localStorage.removeItem('dark_theme');
        }
    });

    // Обработчик для переключения языка
    langToggle.addEventListener('click', () => {
        document.body.classList.toggle('changed-lang');
        changeLanguage();
        if (document.body.classList.contains('changed-lang')) {
            localStorage.setItem('changed-lang', 'enabled');
        } else {
            localStorage.removeItem('changed-lang');
        }
    });

    // Обработчик для скрытия элементов
    document.addEventListener('click', (event) => {
        if (event.target.closest('.btn_worksheet')) {
            button.classList.toggle('btn_worksheet_enable');
            content.classList.toggle('hide_content');
            subtitle_date.classList.toggle('hide_content');
            footer.classList.toggle('hide_content');

            // Сохранение состояния
            if (button.classList.contains('btn_worksheet_enable')) {
                localStorage.setItem('btn_state', 'visible');
            } else {
                localStorage.setItem('btn_state', 'hidden');
            }
        }
    });
});

window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    updateText();
    setTimeout(() => {
        preloader.classList.add('hidden');
    }, 500); // Задержка перед скрытием
});

