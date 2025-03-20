document.querySelector('.header__up-blocks__theme-toggle').addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');
});

document.addEventListener('click', (event) => {
    const button = event.target.closest('.btn_worksheet');
    const content = document.querySelector('.content');
    const subtitle_date = document.querySelector('.subtitle__date');
    const footer = document.querySelector('.footer');
    if (button && content && subtitle_date && footer) {
        button.classList.toggle('btn_worksheet_enable');
        content.classList.toggle('hide_content');
        subtitle_date.classList.toggle('hide_content')
        footer.classList.toggle('hide_content')
    }
});
