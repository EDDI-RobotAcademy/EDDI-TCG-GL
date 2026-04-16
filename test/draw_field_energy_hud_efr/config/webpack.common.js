const path = require("path");

module.exports = {
    entry: {
        draw_field_energy_hud_efr: "./test/draw_field_energy_hud_efr/draw_field_energy_hud_efr.ts",
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
            '@resource': path.resolve(__dirname, '../../../resource'),
        },
        fallback: {
            "fs": false,
            "path": false,
        },
    },
    output: {
        filename: "bundle.js",
        path: path.resolve(__dirname, "../../dist/draw_field_energy_hud_efr"),
    },
};
