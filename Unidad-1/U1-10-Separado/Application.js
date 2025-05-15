import { LoginApplicationView } from './LoginApplicationView.js';

class Application {
    constructor(apiInstanceObject) {
        this._api = apiInstanceObject;
        this._defaultView = new LoginApplicationView(this._api);
    }

    run() {
        this._defaultView.showMainMenu();
    }
}

export { Application };