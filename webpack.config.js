const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
    entry: {
        index: "./src/index.tsx",
        main: "./src/main.tsx",
        project: "./src/project.tsx",
        changeTheme: './src/changeTheme.js',
    },  // Точка входа
    output: {
        path: path.resolve(__dirname, "dist"),  // Папка сборки
        filename: '[name].bundle.js',  // Имя итогового файла
        publicPath: "/SimpleSheduleWork/", // ВАЖНО! Для корректной работы маршрутов
    },
    mode: "development",  // Можно сменить на 'production'
    module: {
        rules: [
            {
                test: /\.jsx?$/,  // Файлы JS и JSX
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                },
            },
            {
                test: /\.css$/,  // Поддержка CSS
                use: [MiniCssExtractPlugin.loader, 'css-loader'], // Заменяем style-loader на MiniCssExtractPlugin.loader
            },
            {
                test: /\.tsx$/, // Применять загрузчик только к TypeScript-файлам
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: [".js", ".jsx", ".ts", ".tsx"],  // Чтобы можно было писать import без расширений
    },
    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            template: "./pages/index.html",
            filename: "index.html",
            chunks: ["index"],
        }),
        new HtmlWebpackPlugin({
            template: "./pages/main.html",
            filename: "main.html",
            chunks: ["main"],
        }),
        new HtmlWebpackPlugin({
            template: "./pages/project.html",
            filename: "project.html",
            chunks: ["project"],
        }),
        new CopyWebpackPlugin({
            patterns: [
                { from: './images/icon.png', to: 'icon.png' }, // Копируем иконку в dist
            ],
        }),
        new MiniCssExtractPlugin({
            filename: '[name].css', // Имя выходного CSS-файла
            publicPath: '/SimpleSheduleWork/', // 🔥 Добавь сюда
        }),
    ],
    devServer: {
        historyApiFallback: true, // ВАЖНО! Позволяет перезагружать страницы без 404
        static: path.join(__dirname, "public"),
        compress: true,
        port: 3000,
        hot: true,
    },
};
