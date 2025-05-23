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
        indexStyles: "./styles/index.css",  // CSS для index.html
        mainStyles: "./styles/main.css",    // CSS для main.html
        projectStyles: "./styles/project.css",  // CSS для project.html
    },  // Точка входа
    output: {
        filename: '[name].bundle.js',  // Имя итогового файла
        publicPath: process.env.NODE_ENV === 'production'
            ? '/SimpleScheduleWork/'  // Для GitHub Pages
            : '/',                 // Для dev-сервера
        path: path.resolve(__dirname, 'dist'),
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
                use: [
                    MiniCssExtractPlugin.loader,  // Извлечение стилей в отдельный файл
                    'css-loader',                 // Обработка CSS
                    'postcss-loader',              // Работа с PostCSS (например, для БЭМ)
                ]
            },
            {
                test: /\.(ts|tsx)$/,
                exclude: /node_modules/,
                use: [
                  {
                    loader: 'babel-loader',
                    options: {
                      presets: [
                        '@babel/preset-env',
                        '@babel/preset-react',
                        '@babel/preset-typescript'
                      ]
                    }
                  },
                  'ts-loader'
                ]
            },
            {
                test: /\.(png|jpg|gif|svg)$/,  // Добавлено правило для изображений
                type: 'asset/resource',
                generator: {
                    filename: 'images/[name][ext]'
                }
            }
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
            chunks: ["index", "indexStyles"], // Подключаем index.css
        }),
        new HtmlWebpackPlugin({
            template: "./pages/main.html",
            filename: "main.html",
            chunks: ["main", "mainStyles"], // Подключаем main.css
        }),
        new HtmlWebpackPlugin({
            template: "./pages/project.html",
            filename: "project.html",
            chunks: ["project", "projectStyles"], // Подключаем project.css
        }),
        new HtmlWebpackPlugin({
            template: "./pages/404.html",
            filename: "404.html",
            chunks: ["404"],
        }),
        new HtmlWebpackPlugin({
            template: "./pages/contact.html",
            filename: "contact.html",
            chunks: ["contact"],
        }),
        new CopyWebpackPlugin({
            patterns: [
                { from: './images/icon.png', to: 'icon.png' }, // Копируем иконку в dist
                { from: './images/employees.png', to: 'employees.png' }, // Копируем иконку в dist
                { from: './images/employeesN.png', to: 'employeesN.png' }, // Копируем иконку в dist
                { from: './images/projects.png', to: 'projects.png' }, // Копируем иконку в dist
                { from: './images/projectsN.png', to: 'projectsN.png' }, // Копируем иконку в dist
                { from: './images/account.png', to: 'account.png' }, // Копируем иконку в dist
                { from: './images/404.png', to: '404.png' }, // Копируем иконку в dist
                { from: './images', to: 'images' },  // Копируем всю папку images
            ],
        }),
        new MiniCssExtractPlugin({
            filename: '[name].css',
            chunkFilename: '[id].css',
        }),
    ],
    devServer: {
        static: path.join(__dirname, "public"),
        compress: true,
        port: 3000,
        hot: true,
        historyApiFallback: {
            rewrites: [
                { from: /.*/, to: '/404.html' } // Перенаправляет все несуществующие маршруты на 404.html
            ]
        }
    },
};