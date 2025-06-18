import { ApplicationUI } from './ApplicationUI.js';

class Application {
    constructor(modelInstance) {
        this._model = modelInstance;
        this._defaultView = new ApplicationUI(this._model);
    }

    run() {
        this._defaultView.showMainMenu();
    }
}

export { Application };