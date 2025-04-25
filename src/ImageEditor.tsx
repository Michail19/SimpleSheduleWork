import React, { useRef, useEffect } from 'react';

interface ImageEditorProps {
    src: string;
    letter: string;
}

const ImageEditor: React.FC<ImageEditorProps> = ({ src, letter}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const img = new Image();
        img.crossOrigin = 'Anonymous'; // Для загрузки с других доменов

        img.onload = () => {
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;

            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            // Сохраняем прозрачность PNG
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);

            // Настройки текста
            ctx.fillStyle = 'rgba(255, 0, 0, 0.7)'; // Красный с прозрачностью
            ctx.font = `bold ${canvas.width / 3}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            ctx.fillText(letter, canvas.width/2, canvas.height/2);
        };

        img.src = src;
    }, [src, letter]);

    return <canvas ref={canvasRef} className='header__up-blocks__wrapper__icon_gen' />;
};

export default ImageEditor;
