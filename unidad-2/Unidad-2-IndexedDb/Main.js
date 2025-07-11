import { ApplicationModel } from './ApplicationModel.js';
import { Application } from './Application.js';

async function main() {
    let model = new ApplicationModel();
    await model.init(); 
    let app = new Application(model);

    app.run();
}

window.onload = main;