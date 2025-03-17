const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

module.exports = {
    entry: "./src/index.js",  // Точка входа
    output: {
        path: path.resolve(__dirname, "dist"),  // Папка сборки
        filename: "bundle.js",  // Имя итогового файла
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
                use: ["style-loader", "css-loader"],
            },
        ],
    },
    resolve: {
        extensions: [".js", ".jsx"],  // Чтобы можно было писать import без расширений
    },
    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            template: "./public/index.html",
        }),
    ],
    devServer: {
        static: path.join(__dirname, "dist"),
        compress: true,
        port: 3000,
        hot: true,
    },
};
