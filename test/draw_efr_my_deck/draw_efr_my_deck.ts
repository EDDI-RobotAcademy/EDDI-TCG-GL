import {UserWindowSize} from "../../src/window_size/WindowSize";
import {MyDeckView} from "../../src/ui/screens/my_deck/MyDeckView";


const rootElement = document.getElementById('app');

if (!rootElement) {
    throw new Error("Cannot find element with id 'app'.");
}

const userWindowSize = UserWindowSize.getInstance();
const myDeckView = MyDeckView.getInstance(rootElement);
myDeckView.initialize();