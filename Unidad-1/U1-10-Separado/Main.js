import { PasswordManager } from './PasswordManager.js';
import { APIModelAccess } from './APIModelAccess.js';
import { Application } from './Application.js';

function main() {
    const passwordManager = new PasswordManager();
    let model = new APIModelAccess(passwordManager);
    let app = new Application(model);

    app.run();
}

window.onload = main;