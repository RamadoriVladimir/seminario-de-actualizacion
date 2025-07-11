import { IndexedDB } from './IndexedDB.js';

class ApplicationModel {
    #userDB;
    #productDB;

    constructor() {
        this._passwordManager = {
            minLength: 8,
            maxLength: 16,
            minUppercase: 1,
            minSpecialChars: 2,
            specialChars: '!@#$%^&*()_+-=[]{};\':"\\|,.<>/?',
        };

        this.#userDB = new IndexedDB("AuthDB", 1, "users");
        this.#productDB = new IndexedDB("InventoryDB", 1, "products");

        this._maxLoginFailedAttempts = 3;
        this._rolePermissions = {
            Administrador: ['all', 'manage_users'],
            Vendedor: ['view_products', 'purchase', 'view_stock'],
            TrabajadorDeposito: ['view_products', 'manage_products', 'manage_stock', 'view_stock'],
            Cliente: ['view_products', 'purchase']
        };
    }

    async init() {
        console.log("[ApplicationModel] Initializing database connections...");
        await this.#userDB.open();
        await this.#productDB.open();
        console.log("[ApplicationModel] Database connections opened. Initializing default data...");
        await this.#initializeDefaultData();
        console.log("[ApplicationModel] Default data initialization complete.");
    }

    async #initializeDefaultData() {
        const users = await this.#userDB.getAll();
        console.log(`[ApplicationModel] Found ${users.length} users in 'AuthDB'.`);
        if (users.length === 0) {
            console.log("[ApplicationModel] Adding default user data...");
            let userData = [
                {
                    id: 'admin',
                    password: 'Admin@123!',
                    failedLoginCounter: 0,
                    isLocked: false,
                    role: 'Administrador',
                    permissions: this._rolePermissions['Administrador']
                },
                {
                    id: 'vendedor1',
                    password: 'Vendedor@123!',
                    failedLoginCounter: 0,
                    isLocked: false,
                    role: 'Vendedor',
                    permissions: this._rolePermissions['Vendedor']
                },
                {
                    id: 'deposito1',
                    password: 'Deposito@123!',
                    failedLoginCounter: 0,
                    isLocked: false,
                    role: 'TrabajadorDeposito',
                    permissions: this._rolePermissions['TrabajadorDeposito']
                },
                {
                    id: 'cliente1',
                    password: 'Cliente@123!',
                    failedLoginCounter: 0,
                    isLocked: false,
                    role: 'Cliente',
                    permissions: this._rolePermissions['Cliente']
                }
            ];
            for (const user of userData) {
                console.log(`[ApplicationModel] Attempting to add user: ${user.id}`);
                await this.#userDB.add(user);
            }
            console.log("[ApplicationModel] Default user data addition complete.");
        } else {
            console.log("[ApplicationModel] Users already exist, skipping default user data initialization.");
        }

        const products = await this.#productDB.getAll();
        console.log(`[ApplicationModel] Found ${products.length} products in 'InventoryDB'.`);
        if (products.length === 0) {
            console.log("[ApplicationModel] Adding default product data...");
            let productData = [
                {
                    id: 1,
                    nombre: 'Lavandina x 1L',
                    precio: 875.25,
                    stock: 3000
                },
                {
                    id: 4,
                    nombre: 'Detergente x 500mL',
                    precio: 1102.45,
                    stock: 2010
                },
                {
                    id: 22,
                    nombre: 'Jabon en polvo x 250g',
                    precio: 650.22,
                    stock: 407
                }
            ];
            for (const product of productData) {
                console.log(`[ApplicationModel] Attempting to add product: ${product.id}`);
                await this.#productDB.add(product);
            }
            console.log("[ApplicationModel] Default product data addition complete.");
        } else {
            console.log("[ApplicationModel] Products already exist, skipping default product data initialization.");
        }
    }

    isSecurePassword(password) {
        if (password.length < this._passwordManager.minLength || password.length > this._passwordManager.maxLength) {
            return {valid: false, message: `La contraseña debe tener entre ${this._passwordManager.minLength} y ${this._passwordManager.maxLength} caracteres`};
        }

        let upperCaseCount = 0;
        for (let char of password) {
            if (char >= 'A' && char <= 'Z') {
                upperCaseCount++;
            }
        }
        if (upperCaseCount < this._passwordManager.minUppercase) {
            return {valid: false, message: `Debe contener al menos ${this._passwordManager.minUppercase} mayuscula(s)`};
        }

        let specialCharsCount = 0;
        for (let char of password) {
            if (this._passwordManager.specialChars.includes(char)) {
                specialCharsCount++;
            }
        }
        if (specialCharsCount < this._passwordManager.minSpecialChars) {
            return {valid: false, message: `Debe contener al menos ${this._passwordManager.minSpecialChars} caracteres especiales (${this._passwordManager.specialChars})`};
        }

        for (let char of password) {
            const isLowercase = char >= 'a' && char <= 'z';
            const isUppercase = char >= 'A' && char <= 'Z';
            const isNumber = char >= '0' && char <= '9';
            const isSpecialChar = this._passwordManager.specialChars.includes(char);
            
            if (!(isLowercase || isUppercase || isNumber || isSpecialChar)) {
                return {valid: false, message: "Contiene caracteres no permitidos"};
            }
        }

        return {valid: true, message: "Contraseña valida"};
    }

    async getAllProducts() {
        return await this.#productDB.getAll();
    }

    async addProduct(id, nombre, precio, stock) {
        const exists = await this.#productDB.get(id);
        if (exists) {
            return {success: false, message: "El ID del producto ya existe"};
        }
        await this.#productDB.add({id, nombre, precio, stock});
        return {success: true, message: "Producto agregado exitosamente"};
    }

    async updateProduct(id, newData) {
        const product = await this.#productDB.get(id);
        if (!product) {
            return {success: false, message: "Producto no encontrado"};
        }
        Object.assign(product, newData);
        await this.#productDB.put(product);
        return {success: true, message: "Producto actualizado exitosamente"};
    }

    async deleteProduct(id) {
        const exists = await this.#productDB.get(id);
        if (!exists) {
            return {success: false, message: "Producto no encontrado"};
        }
        await this.#productDB.delete(id);
        return {success: true, message: "Producto eliminado exitosamente"};
    }

    async productExists(id) {
        const product = await this.#productDB.get(id);
        return !!product;
    }

    async getProduct(id) {
        const product = await this.#productDB.get(id);
        return product || null;
    }

    async purchaseProduct(id, quantity) {
        const product = await this.#productDB.get(id);
        
        if (!product) {
            return {success: false, message: "Producto no encontrado"};
        }
        
        if (product.stock <= 0) {
            return {success: false, message: "No hay stock disponible de este producto"};
        }
        
        if (quantity <= 0) {
            return {success: false, message: "La cantidad debe ser mayor a cero"};
        }
        
        if (quantity > product.stock) {
            return {success: false, message: `No hay suficiente stock. Disponible: ${product.stock}`};
        }
        
        product.stock -= quantity;
        await this.#productDB.put(product);
        return {
            success: true, 
            message: `Compra realizada. Nuevo stock: ${product.stock}`,
            total: quantity * product.precio
        };
    }

    async isValidUserGetData(username) {
        return await this.#userDB.get(username);
    }

    async userExists(username) {
        const user = await this.#userDB.get(username);
        return !!user;
    }

    async createUser(username, password, role, requesterUsername = null) {
        if (requesterUsername && !(await this.checkPermission(requesterUsername, 'manage_users'))) {
            return {success: false, message: "No tiene permisos para crear usuarios"};
        }

        if (await this.userExists(username)) {
            return {success: false, message: "El nombre de usuario ya existe"};
        }

        const validation = this.isSecurePassword(password);
        if (!validation.valid) {
            return {success: false, message: `La contraseña no cumple los requisitos: ${validation.message}`};
        }

        if (!this._rolePermissions[role]) {
            return {success: false, message: "Rol no valido"};
        }

        await this.#userDB.add({
            id: username, // Usar el nombre de usuario como keyPath
            password: password,
            failedLoginCounter: 0,
            isLocked: false,
            role: role,
            permissions: this._rolePermissions[role]
        });

        return {success: true, message: "Usuario creado exitosamente"};
    }

    async getUserRole(username) {
        const user = await this.#userDB.get(username);
        return user ? user.role : null;
    }

    async checkPermission(username, permission) {
        const user = await this.#userDB.get(username);
        if (!user) return false;
        return user.permissions.includes('all') || user.permissions.includes(permission);
    }

    async authenticateUser(username, password) {
        let api_return = {
            status: false,
            result: null
        };

        if ((username != undefined && username != null && username != '') && 
            (password != undefined && password != null && password != '')) {
            let userdata = await this.isValidUserGetData(username); 

            if (userdata) {
                if (userdata.isLocked == false) {
                    if (userdata.password === password) {
                        api_return.status = true;
                        api_return.username = username;
                        userdata.failedLoginCounter = 0; // Resetear contador de intentos fallidos
                        await this.#userDB.put(userdata); 
                    } else {
                        api_return.status = false;
                        api_return.result = 'USER_PASSWORD_FAILED';

                        userdata.failedLoginCounter++;
                        
                        if (userdata.failedLoginCounter >= this._maxLoginFailedAttempts) { 
                            userdata.isLocked = true;
                            api_return.result = 'BLOCKED_USER';
                        }
                        await this.#userDB.put(userdata); 
                    }
                } else {
                    api_return.status = false;
                    api_return.result = 'BLOCKED_USER';
                }
            } else {
                api_return.status = false;
                api_return.result = 'USER_PASSWORD_FAILED';
            }
        }
        
        return api_return;
    }

    getMaxLoginAttempts() {
        return this._maxLoginFailedAttempts;
    }

    async changePassword(username, currentPassword, newPassword) {
        let userdata = await this.isValidUserGetData(username); 
        
        if (userdata && userdata.password === currentPassword) {
            const validation = this.isSecurePassword(newPassword);
            if (validation.valid) {
                userdata.password = newPassword;
                await this.#userDB.put(userdata); 
                return {success: true, message: "Contraseña cambiada exitosamente."};
            } else {
                return {success: false, message: `La nueva contraseña no es segura: ${validation.message}`};
            }
        }
        return {success: false, message: "No se pudo cambiar la contraseña. Verifique su contraseña actual."};
    }

    async getAllUsers(requesterUsername) {
        if (!(await this.checkPermission(requesterUsername, 'manage_users'))) { 
            return {success: false, message: "No tiene permisos para ver usuarios"};
        }

        const users = await this.#userDB.getAll(); 
        return {
            success: true,
            data: users.map(user => ({
                username: user.id,
                role: user.role,
                isLocked: user.isLocked
            }))
        };
    }

    async toggleUserLock(username, requesterUsername) {
        if (!(await this.checkPermission(requesterUsername, 'manage_users'))) { 
            return {success: false, message: "No tiene permisos para gestionar usuarios"};
        }

        const user = await this.#userDB.get(username); 
        if (!user) {
            return {success: false, message: "Usuario no encontrado"};
        }

        user.isLocked = !user.isLocked;
        user.failedLoginCounter = 0;
        await this.#userDB.put(user); 
        return {
            success: true, 
            message: `Usuario ${user.isLocked ? 'bloqueado' : 'desbloqueado'} exitosamente`
        };
    }

    async hasPermission(username, permission) {
        return await this.checkPermission(username, permission); 
    }
}

export { ApplicationModel };