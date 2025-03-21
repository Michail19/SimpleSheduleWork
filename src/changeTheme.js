document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.querySelector('.header__up-blocks__theme-toggle');
    const button = document.querySelector('.btn_worksheet');
    const content = document.querySelector('.content');
    const subtitle_date = document.querySelector('.subtitle__date');
    const footer = document.querySelector('.footer');

    // Восстанавливаем состояние темы
    if (localStorage.getItem('dark_theme') === 'enabled') {
        document.body.classList.add('dark-theme');
    }

    // Восстанавливаем состояние скрытых элементов
    if (localStorage.getItem('btn_state') !== 'enabled') {
        content.classList.add('hide_content');
        subtitle_date.classList.add('hide_content');
        footer.classList.add('hide_content');
        button.classList.toggle('btn_worksheet_enable');
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

    // Обработчик для скрытия элементов
    document.addEventListener('click', (event) => {
        if (event.target.closest('.btn_worksheet')) {
            button.classList.toggle('btn_worksheet_enable');
            content.classList.toggle('hide_content');
            subtitle_date.classList.toggle('hide_content');
            footer.classList.toggle('hide_content');

            // Сохранение состояния
            if (button.classList.contains('btn_worksheet_enable')) {
                localStorage.setItem('btn_state', 'enabled');
            } else {
                localStorage.removeItem('btn_state');
            }
        }
    });
});

window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    setTimeout(() => {
        preloader.classList.add('hidden');
    }, 500); // Задержка перед скрытием
});
