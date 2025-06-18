import { ApplicationModel } from './ApplicationModel.js';
import { Application } from './Application.js';

function main() {
    let model = new ApplicationModel();
    let app = new Application(model);

    app.run();
}

window.onload = main;