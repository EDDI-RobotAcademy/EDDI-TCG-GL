const path = require("path");

module.exports = {
    entry: {
        rectangle_image: "./test/shop_draw_background/shop_draw_background.ts"
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: "ts-loader",
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js"],
    },
    output: {
        filename: "bundle.js",
        path: path.resolve(__dirname, "../../dist/shop_draw_background"),
    },
};