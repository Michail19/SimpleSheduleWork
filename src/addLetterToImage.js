export function addLetterToPng(imageUrl, letter) {
    const canvas = document.createElement('canvas');
    const img = new Image();

    img.onload = function() {
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        // Для PNG с прозрачностью - заливаем фон (опционально)
        ctx.fillStyle = '#ffffff'; // Белый фон
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0); // Повторно рисуем поверх фона

        // Добавляем текст
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 80px Arial';
        ctx.fillText(letter, canvas.width/2, canvas.height/2);

        // Получаем результат как PNG (сохраняет прозрачность)
        const pngUrl = canvas.toDataURL('image/png');
        return pngUrl;
    };

    img.src = imageUrl;
}