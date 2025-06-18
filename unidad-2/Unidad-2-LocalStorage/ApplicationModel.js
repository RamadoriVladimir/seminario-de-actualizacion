class ApplicationModel {
    constructor() {
        this._passwordManager = {
            minLength: 8,
            maxLength: 16,
            minUppercase: 1,
            minSpecialChars: 2,
            specialChars: '!@#$%^&*()_+-=[]{};\':"\\|,.<>/?',
        };

        const savedInventory = localStorage.getItem('inventoryData');
        if (savedInventory) {
            this._inventoryData = new Map(JSON.parse(savedInventory));
        } else {
        this._inventoryData = new Map();
        
        let productData = [
            {
                nombre: 'Lavandina x 1L',
                precio: 875.25,
                stock: 3000
            },
            {
                nombre: 'Detergente x 500mL',
                precio: 1102.45,
                stock: 2010
            },
            {
                nombre: 'Jabon en polvo x 250g',
                precio: 650.22,
                stock: 407
            }
        ];

        this._inventoryData.set(1, productData[0]);
        this._inventoryData.set(4, productData[1]);
        this._inventoryData.set(22, productData[2]);
        this.saveInventory();
        };

        const storedAuth = localStorage.getItem('authData');
        if (storedAuth) {
            this._authData = new Map(JSON.parse(storedAuth));
        } else {
            this._authData = new Map();
            this._maxLoginFailedAttempts = 3;
            this._rolePermissions = {
                Administrador: ['all', 'manage_users'],
                Vendedor: ['view_products', 'purchase', 'view_stock'],
                TrabajadorDeposito: ['view_products', 'manage_products', 'manage_stock', 'view_stock'],
                Cliente: ['view_products', 'purchase']
            };

        let userData = [
            {
                password: 'Admin@123!',
                failedLoginCounter: 0,
                isLocked: false,
                role: 'Administrador',
                permissions: this._rolePermissions['Administrador']
            },
            {
                password: 'Vendedor@123!',
                failedLoginCounter: 0,
                isLocked: false,
                role: 'Vendedor',
                permissions: this._rolePermissions['Vendedor']
            },
            {
                password: 'Deposito@123!',
                failedLoginCounter: 0,
                isLocked: false,
                role: 'TrabajadorDeposito',
                permissions: this._rolePermissions['TrabajadorDeposito']
            },
            {
                password: 'Cliente@123!',
                failedLoginCounter: 0,
                isLocked: false,
                role: 'Cliente',
                permissions: this._rolePermissions['Cliente']
            }
        ];

        this._authData.set('admin', userData[0]);
        this._authData.set('vendedor1', userData[1]);
        this._authData.set('deposito1', userData[2]);
        this._authData.set('cliente1', userData[3]);
        this.saveAuthData();
        }
    }

    saveInventory() {
        localStorage.setItem('inventoryData', JSON.stringify(Array.from(this._inventoryData.entries())));
    }

    saveAuthData() {
        localStorage.setItem('authData', JSON.stringify(Array.from(this._authData.entries())));
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

    getAllProducts() {
        return Array.from(this._inventoryData.entries()).map(([id, product]) => ({
            id,
            ...product
        }));
    }

    addProduct(id, nombre, precio, stock) {
        if (this._inventoryData.has(id)) {
            return {success: false, message: "El ID del producto ya existe"};
        }
        this._inventoryData.set(id, {nombre, precio, stock});
        this.saveInventory();
        return {success: true, message: "Producto agregado exitosamente"};
    }

    updateProduct(id, newData) {
        if (!this._inventoryData.has(id)) {
            return {success: false, message: "Producto no encontrado"};
        }
        const product = this._inventoryData.get(id);
        Object.assign(product, newData);
        this.saveInventory();
        return {success: true, message: "Producto actualizado exitosamente"};
    }

    deleteProduct(id) {
        if (!this._inventoryData.has(id)) {
            return {success: false, message: "Producto no encontrado"};
        }
        this._inventoryData.delete(id);
        this.saveInventory();
        return {success: true, message: "Producto eliminado exitosamente"};
    }

    productExists(id) {
        return this._inventoryData.has(id);
    }

    getProduct(id) {
        if (!this._inventoryData.has(id)) {
            return null;
        }
        return {
            id,
            ...this._inventoryData.get(id)
        };
    }

    purchaseProduct(id, quantity) {
        if (!this._inventoryData.has(id)) {
            return {success: false, message: "Producto no encontrado"};
        }
        
        const product = this._inventoryData.get(id);
        
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
        this.saveInventory();
        return {
            success: true, 
            message: `Compra realizada. Nuevo stock: ${product.stock}`,
            total: quantity * product.precio
        };
    }

    isValidUserGetData(username) {
        return this._authData.get(username);
    }

    userExists(username) {
        return this._authData.has(username);
    }

    createUser(username, password, role, requesterUsername = null) {
        if (requesterUsername && !this.checkPermission(requesterUsername, 'manage_users')) {
            return {success: false, message: "No tiene permisos para crear usuarios"};
        }

        if (this.userExists(username)) {
            return {success: false, message: "El nombre de usuario ya existe"};
        }

        const validation = this._passwordManager.isSecurePassword(password);
        if (!validation.valid) {
            return {success: false, message: `La contraseña no cumple los requisitos: ${validation.message}`};
        }

        if (!this._rolePermissions[role]) {
            return {success: false, message: "Rol no valido"};
        }

        this._authData.set(username, {
            password: password,
            failedLoginCounter: 0,
            isLocked: false,
            role: role,
            permissions: this._rolePermissions[role]
        });

        this.saveAuthData();

        return {success: true, message: "Usuario creado exitosamente"};
    }

    getUserRole(username) {
        const user = this._authData.get(username);
        return user ? user.role : null;
    }

    checkPermission(username, permission) {
        const user = this._authData.get(username);
        if (!user) return false;
        return user.permissions.includes('all') || user.permissions.includes(permission);
    }

    authenticateUser(username, password) {
        let api_return = {
            status: false,
            result: null
        };

        if ((username != undefined && username != null && username != '') && 
            (password != undefined && password != null && password != '')) {
            let userdata = this.isValidUserGetData(username);

            if (userdata) {
                if (userdata.isLocked == false) {
                    if (userdata.password === password) {
                        api_return.status = true;
                        api_return.username = username;
                    } else {
                        api_return.status = false;
                        api_return.result = 'USER_PASSWORD_FAILED';

                        userdata.failedLoginCounter++;
                        
                        if (userdata.failedLoginCounter == this._maxLoginFailedAttempts) {
                            userdata.isLocked = true;
                            api_return.result = 'BLOCKED_USER';
                        }
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

    changePassword(username, currentPassword, newPassword) {
        let userdata = this.isValidUserGetData(username);
        
        if (userdata && userdata.password === currentPassword) {
            const validation = this._passwordManager.isSecurePassword(newPassword);
            if (validation.valid) {
                userdata.password = newPassword;
                this.saveAuthData();
                return {success: true, message: "Contraseña cambiada exitosamente."};
            } else {
                return {success: false, message: `La nueva contraseña no es segura: ${validation.message}`};
            }
        }
        return {success: false, message: "No se pudo cambiar la contraseña. Verifique su contraseña actual."};
    }

    getAllUsers(requesterUsername) {
        if (!this.checkPermission(requesterUsername, 'manage_users')) {
            return {success: false, message: "No tiene permisos para ver usuarios"};
        }

        return {
            success: true,
            data: Array.from(this._authData.entries()).map(([username, user]) => ({
                username,
                role: user.role,
                isLocked: user.isLocked
            }))
        };
    }

    toggleUserLock(username, requesterUsername) {
        if (!this.checkPermission(requesterUsername, 'manage_users')) {
            return {success: false, message: "No tiene permisos para gestionar usuarios"};
        }

        const user = this._authData.get(username);
        if (!user) {
            return {success: false, message: "Usuario no encontrado"};
        }

        user.isLocked = !user.isLocked;
        this.saveAuthData();    
        return {
            success: true, 
            message: `Usuario ${user.isLocked ? 'bloqueado' : 'desbloqueado'} exitosamente`
        };
    }

    hasPermission(username, permission) {
        return this.checkPermission(username, permission);
    }
}

export { ApplicationModel };