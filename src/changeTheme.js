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
        list_of_projects: "Список проектов",
        welcome: "Добро пожаловать в ",
        description: "— это инструмент для эффективного планирования и управления рабочим графиком сотрудников. Система предоставляет простое и наглядное представление расписания, а также управление привязкой сотрудников к проектам. Организуйте рабочие недели, контролируйте занятость и управляйте проектами — всё в одном месте.",
        features: "Возможности:",
        feature_edit: "<strong>Гибкое редактирование расписания</strong>: управление временем по дням и неделям, визуальное выделение выходных и смен.",
        feature_projects: "<strong>Быстрый доступ к проектам</strong>: фильтрация, просмотр привязок сотрудников.",
        feature_interface: "<strong>Интуитивный интерфейс</strong>: ничего лишнего, всё на одном экране.",
        feature_scaling: "<strong>Масштабирование</strong>: переключение между неделями и сотрудниками.",
        edit_schedule: "Редактирование графика сотрудников",
        advantages: "Преимущества сервиса:",
        advantage_fast_edit: "Быстрое редактирование расписания — прямо в таблице",
        advantage_planning: "Планирование на несколько недель вперёд",
        advantage_binding: "Привязка сотрудников к проектам",
        advantage_roles: "Роли пользователей: владелец и сотрудники",
        advantage_cloud: "Хранение данных в облаке",
        advantage_mobile: "Удобный интерфейс на мобильных устройствах",
        view_projects: "Просмотр и фильтрация проектов",
        why_ssw: "Почему именно SSW?",
        why_team: "Упрощает работу даже с большими командами.",
        why_transparency: "Повышает прозрачность загруженности сотрудников.",
        why_risk: "Уменьшает риск накладок и ошибок при планировании.",
        to_home: "Главная",
        possibilities: "Возможности",
        why: "Почему SSW?",
        go_schedule: "Перейти к расписанию",
        go_projects: "К проектам",
        contacts: "Контакты",
        author: "© Михаил Ершов"
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
        list_of_projects: "List of projects",
        welcome: "Welcome to",
        description: "SimpleScheduleWork is a tool for effective planning and managing employee work schedules. The system provides a simple and visual representation of schedules, as well as management of employee project assignments. Organize work weeks, control workload, and manage projects — all in one place.",
        features: "Features:",
        feature_edit: "<strong>Flexible schedule editing</strong>: manage time by days and weeks, highlight weekends and shifts.",
        feature_projects: "<strong>Quick access to projects</strong>: filter and view employee assignments.",
        feature_interface: "<strong>Intuitive interface</strong>: nothing extra, everything on one screen.",
        feature_scaling: "<strong>Scaling</strong>: switch between weeks and employees.",
        edit_schedule: "Employee schedule editing",
        advantages: "Service Advantages:",
        advantage_fast_edit: "Quick schedule editing — directly in the table",
        advantage_planning: "Planning several weeks ahead",
        advantage_binding: "Employee assignment to projects",
        advantage_roles: "User roles: owner and employees",
        advantage_cloud: "Cloud data storage",
        advantage_mobile: "Convenient mobile interface",
        view_projects: "Viewing and filtering projects",
        why_ssw: "Why SSW?",
        why_team: "Simplifies work even with large teams.",
        why_transparency: "Improves transparency of employee workload.",
        why_risk: "Reduces the risk of overlaps and scheduling errors.",
        to_home: "Home",
        possibilities: "Features",
        why: "Why SSW?",
        go_schedule: "Go to schedule",
        go_projects: "To projects",
        contacts: "Contacts",
        author: "© Mikhail Ershov"
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
        el.innerHTML = translations[currentLang][key];
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

