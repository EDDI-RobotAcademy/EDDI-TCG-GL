const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");
const path = require("path");

module.exports = merge(common, {
    mode: "development",
    devtool: "eval-source-map",
    devServer: {
        static: [
            { directory: path.join(__dirname, "../") },
            // 저장소 전체다. 지켜보지 않는다. 안의 무엇이 바뀌든 화면이 다시 뜬다.
            { directory: path.join(__dirname, "../../../"), watch: false },
            { directory: path.join(__dirname, "../../../resource"), watch: false },
        ],
        hot: true,
        historyApiFallback: true,
    },
});
