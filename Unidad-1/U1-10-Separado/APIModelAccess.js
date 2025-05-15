import { InventoryModelAccess } from './InventoryModelAccess.js';
import { PasswordManager } from './PasswordManager.js';

class APIModelAccess {
    constructor(passwordManager) {
        this._authData = new Map();
        this._maxLoginFailedAttempts = 3;
        this._passwordManager = passwordManager;
        this._inventory = new InventoryModelAccess();
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
    }

    getInventoryManager() {
        return this._inventory;
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
        return {
            success: true, 
            message: `Usuario ${user.isLocked ? 'bloqueado' : 'desbloqueado'} exitosamente`
        };
    }

    hasPermission(username, permission) {
        return this.checkPermission(username, permission);
    }
}

export { APIModelAccess };