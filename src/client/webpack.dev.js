const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");
const path = require("path");

module.exports = merge(common, {
    mode: "development",
    devtool: "eval-source-map",
    devServer: {
        static: [
            // index.html 이 있는 곳.
            //
            // 지켜보지 않는다. 저장소 전체를 지켜보면 그 안의 무엇이 바뀌든
            // 화면이 다시 뜬다. 문서를 고쳐도, 다른 것이 파일을 건드려도 그렇다.
            { directory: path.join(__dirname, "../../"), watch: false },
            // 카드와 배경 그림이 있는 곳. 그림은 실행 중에 안 바뀐다.
            { directory: path.join(__dirname, "../../resource"), watch: false },
        ],
        hot: true,
        // 화면을 오갈 때 주소가 바뀌는데, 그 주소로 새로 고쳐도 index.html 을 준다.
        historyApiFallback: true,
    },
});