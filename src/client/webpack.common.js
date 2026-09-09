const path = require("path");

module.exports = {
    // 게임의 진입점이다. 전에는 없는 폴더를 가리켜서 기본 실행 명령이 안 돌았다.
    entry: {
        main: "./src/client/main.ts",
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: "ts-loader",
                exclude: /node_modules/,
            },
            {
                test: /\.(png|jpg|gif)$/i,
                type: 'asset/resource',
            },
            {
                test: /\.json$/,
                type: 'json',
            },
            {
                test: /\.mp3$/,
                use: 'file-loader',
            },
        ],
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js"],
        alias: {
            // 소리와 그림을 짧은 이름으로 가리킨다. tsconfig 의 paths 와 짝이다.
            '@resource': path.resolve(__dirname, '../../resource'),
        },
        fallback: {
            "fs": false,
            "path": false,
        },
    },
    output: {
        filename: "bundle.js",
        path: path.resolve(__dirname, "../../dist/client"),
    },
};
