import {UserWindowSize} from "../../src/window_size/WindowSize";
import {BattleFieldView} from "../../src/ui/screens/battle_field/BattleFieldView";


const rootElement = document.getElementById('app');

if (!rootElement) {
    throw new Error("Cannot find element with id 'app'.");
}

const userWindowSize = UserWindowSize.getInstance();
const battleFieldView = BattleFieldView.getInstance(rootElement);
battleFieldView.initialize();