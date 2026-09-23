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
        // 나중에 받아 오는 화면 덩이의 이름 (R2-134).
        chunkFilename: "[name].chunk.js",
        path: path.resolve(__dirname, "../../dist/client"),
        // **뿌리에서 받아 온다.** 화면을 옮기면 주소가 /tcg-card-shop 처럼 깊어지는데,
        // 이것을 안 적으면 덩이를 /tcg-card-shop/1.chunk.js 에서 찾아 못 받는다.
        publicPath: "/",
    },
};
