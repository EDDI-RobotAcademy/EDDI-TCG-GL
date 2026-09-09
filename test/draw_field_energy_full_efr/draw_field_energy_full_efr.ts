// 전투 화면을 혼자 띄워 보는 확인용 진입점이다.
//
// 화면 자체는 src/battle/view/SimulationBattleFieldView 에 있다. 로비에서 들어가는
// 것과 같은 것을 띄운다. 여기서 보이는 것이 곧 본편에서 보이는 것이다.
import { SimulationBattleFieldView } from "../../src/battle/view/SimulationBattleFieldView";

const rootElement = document.getElementById('app');

if (!rootElement) {
    throw new Error("Cannot find element with id 'app'.");
}

SimulationBattleFieldView.getInstance(rootElement).initialize();
