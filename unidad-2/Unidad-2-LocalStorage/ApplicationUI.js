class ApplicationUI {
    constructor(modelInstance) {
        this._model = modelInstance; 
    }

    showMainMenu() {
        while (true) {
            let option = window.prompt(
                "Menu Principal:\n" +
                "1. Iniciar sesion\n" +
                "2. Crear cuenta de usuario\n" +
                "X. Salir del sistema\n\n" +
                "Seleccione una opcion:"
            );

            switch(option) {
                case "1":
                    this.showLogin();
                    break;
                case "2":
                    this.showCreateAccount();
                    break;
                case "X":
                case "x":
                    return;
                default:
                    alert("Opcion no valida. Intente nuevamente.");
            }
        }
    }

    showLogin() {
        let username = window.prompt("Ingrese su nombre de usuario:");
        let password = window.prompt("Ingrese contraseña:");

        let api_return = this._model.authenticateUser(username, password);
        
        if (api_return.status) {
            alert('Usuario autenticado exitosamente');
            this.showUserMenu(api_return.username);
        } else if (api_return.status == false) {
            switch (api_return.result) {
                case 'BLOCKED_USER':
                    alert('Usuario bloqueado. Contacte al administrador');
                    break;
                case 'USER_PASSWORD_FAILED':
                    alert('Usuario y/o contraseña incorrecta');
                    break;
                default:
                    alert('Error desconocido');
                    break;
            }
        }
    }

    showCreateAccount(adminUsername = null) {
        if (adminUsername && !this._model.hasPermission(adminUsername, 'manage_users')) {
            alert("No tiene permisos para crear usuarios");
            return;
        }

        let username = window.prompt("Ingrese un nombre de usuario:");
        if (username === null) return;

        if (this._model.userExists(username)) {
            alert("El nombre de usuario ya existe. Por favor elija otro.");
            return;
        }

        let role = window.prompt(
            "Seleccione el rol del usuario:\n" +
            "1. Administrador\n" +
            "2. Vendedor\n" +
            "3. Trabajador de deposito\n" +
            "4. Cliente\n\n" +
            "Ingrese el numero correspondiente:"
        );

        let roleName;
        switch(role) {
            case '1':
                roleName = 'Administrador';
                break;
            case '2':
                roleName = 'Vendedor';
                break;
            case '3':
                roleName = 'TrabajadorDeposito';
                break;
            case '4':
                roleName = 'Cliente';
                break;
            default:
                alert("Opcion de rol no valida");
                return;
        }

        let password = window.prompt(
            "Ingrese una contraseña:\n" +
            "Requisitos:\n" +
            `- Entre ${this._model._passwordManager.minLength} y ${this._model._passwordManager.maxLength} caracteres\n` +
            `- Al menos ${this._model._passwordManager.minUppercase} mayuscula(s)\n` +
            `- Al menos ${this._model._passwordManager.minSpecialChars} simbolos especiales\n` +
            `- Caracteres especiales permitidos: ${this._model._passwordManager.specialChars}\n\n` +
            "Ingrese su contraseña:"
        );

        if (password === null) return;

        let confirmPassword = window.prompt("Confirme su contraseña:");
        if (password !== confirmPassword) {
            alert("Las contraseñas no coinciden.");
            return;
        }

        let result = this._model.createUser(username, password, roleName, adminUsername);
        alert(result.message);
    }

    showUserMenu(username) {
        const role = this._model.getUserRole(username);
        let exitMenu = false;
        
        while (!exitMenu) {
            let menuOptions = `Bienvenido ${username} (${role})\n` +
                             "Menu de acciones:\n";

            if (this._model.hasPermission(username, 'manage_products')) {
                menuOptions += "1. Gestion de articulos\n";
            }
            if (this._model.hasPermission(username, 'purchase')) {
                menuOptions += "2. Comprar articulos\n";
            }
            if (this._model.hasPermission(username, 'manage_users')) {
                menuOptions += "4. Gestion de usuarios\n";
            }
            menuOptions += "3. Cambiar contraseña\n" +
                          "X. Cerrar sesion\n" +
                          "Seleccione una opcion:";

            let option = window.prompt(menuOptions);
            
            switch(option) {
                case "1":
                    if (this._model.hasPermission(username, 'manage_products')) {
                        this.showInventoryMenu(username);
                    } else {
                        alert("No tiene permisos para esta accion");
                    }
                    break;
                case "2":
                    if (this._model.hasPermission(username, 'purchase')) {
                        this.purchaseProductMenu();
                    } else {
                        alert("No tiene permisos para esta accion");
                    }
                    break;
                case "3":
                    this.changePasswordMenu(username);
                    break;
                case "4":
                    if (this._model.hasPermission(username, 'manage_users')) {
                        this.showUserManagementMenu(username);
                    } else {
                        alert("No tiene permisos para esta accion");
                    }
                    break;
                case "X":
                case "x":
                    exitMenu = true;
                    alert("Sesion finalizada. Volviendo al menu principal.");
                    break;
                default:
                    alert("Opcion no valida. Intente nuevamente.");
            }
        }
    }

    changePasswordMenu(username) {
        let currentPassword = window.prompt("Ingrese su contraseña actual:");
        if (currentPassword === null) return;

        let newPassword = window.prompt(
            "Ingrese su nueva contraseña:\n" +
            "Requisitos:\n" +
            `- Entre ${this._model._passwordManager.minLength} y ${this._model._passwordManager.maxLength} caracteres\n` +
            `- Al menos ${this._model._passwordManager.minUppercase} mayuscula(s)\n` +
            `- Al menos ${this._model._passwordManager.minSpecialChars} simbolos especiales\n` +
            "- Caracteres alfanuméricos\n\n"
        );

        if (newPassword === null) {
            return;
        } else {
            let confirmPassword = window.prompt("Confirme su nueva contraseña:");
            if (newPassword !== confirmPassword) {
                alert("Las contraseñas nuevas no coinciden.");
                return;
            }
        }

        let result = this._model.changePassword(username, currentPassword, newPassword);
        alert(result.message);
    }

    showInventoryMenu(username) {
        let exitMenu = false;
        
        while (!exitMenu) {
            let menuOptions = "Gestion de Articulos:\n";
            
            if (this._model.hasPermission(username, 'view_products')) {
                menuOptions += "1. Listar articulos\n";
            }
            if (this._model.hasPermission(username, 'manage_products')) {
                menuOptions += "2. Nuevo articulo\n" +
                              "3. Editar articulo\n" +
                              "4. Eliminar articulo\n";
            }
            if (this._model.hasPermission(username, 'manage_stock')) {
                menuOptions += "5. Ajustar stock\n";
            }
            menuOptions += "X. Volver al menu anterior\n" +
                          "Seleccione una opcion:";

            let option = window.prompt(menuOptions);
            
            switch(option) {
                case "1":
                    if (this._model.hasPermission(username, 'view_products')) {
                        this.listProducts();
                    } else {
                        alert("No tiene permisos para esta accion");
                    }
                    break;
                case "2":
                    if (this._model.hasPermission(username, 'manage_products')) {
                        this.addProductMenu();
                    } else {
                        alert("No tiene permisos para esta accion");
                    }
                    break;
                case "3":
                    if (this._model.hasPermission(username, 'manage_products')) {
                        this.editProductMenu();
                    } else {
                        alert("No tiene permisos para esta accion");
                    }
                    break;
                case "4":
                    if (this._model.hasPermission(username, 'manage_products')) {
                        this.deleteProductMenu();
                    } else {
                        alert("No tiene permisos para esta accion");
                    }
                    break;
                case "5":
                    if (this._model.hasPermission(username, 'manage_stock')) {
                        this.adjustStockMenu();
                    } else {
                        alert("No tiene permisos para esta accion");
                    }
                    break;
                case "X":
                case "x":
                    exitMenu = true;
                    break;
                default:
                    alert("Opcion no valida. Intente nuevamente.");
            }
        }
    }

    listProducts() {
        const products = this._model.getAllProducts();
        
        let productList = "Listado de Articulos:\n\n";
        products.forEach(product => {
            productList += `ID: ${product.id}\n`;
            productList += `Nombre: ${product.nombre}\n`;
            productList += `Precio: $${product.precio.toFixed(2)}\n`;
            productList += `Stock: ${product.stock}\n\n`;
        });
        
        alert(productList);
    }

    addProductMenu() {
        let id = parseInt(window.prompt("Ingrese el ID del nuevo producto:"));
        if (isNaN(id)) {
            alert("ID invalido. Debe ser un numero.");
            return;
        }
        
        if (this._model.productExists(id)) {
            alert("Ya existe un producto con ese ID.");
            return;
        }
        
        let nombre = window.prompt("Ingrese el nombre del producto:");
        if (!nombre) return;
        
        let precio = parseFloat(window.prompt("Ingrese el precio del producto:"));
        if (isNaN(precio)) {
            alert("Precio invalido. Debe ser un numero.");
            return;
        }
        
        let stock = parseInt(window.prompt("Ingrese el stock inicial del producto:"));
        if (isNaN(stock)) {
            alert("Stock invalido. Debe ser un numero entero.");
            return;
        }
        
        const result = this._model.addProduct(id, nombre, precio, stock);
        alert(result.message);
    }

    editProductMenu() {
        let id = parseInt(window.prompt("Ingrese el ID del producto a editar:"));
        if (isNaN(id)) {
            alert("ID invalido. Debe ser un numero.");
            return;
        }
        
        const product = this._model.getProduct(id);
        if (!product) {
            alert("No existe un producto con ese ID.");
            return;
        }
        
        let newData = {};
        
        let nombre = window.prompt(`Nombre actual: ${product.nombre}\nIngrese nuevo nombre (deje vacio para no cambiar):`, product.nombre);
        if (nombre && nombre !== product.nombre) {
            newData.nombre = nombre;
        }
        
        let precio = window.prompt(`Precio actual: ${product.precio}\nIngrese nuevo precio (deje vacio para no cambiar):`, product.precio);
        if (precio) {
            precio = parseFloat(precio);
            if (isNaN(precio)) {
                alert("Precio invalido. Debe ser un numero.");
                return;
            }
            if (precio !== product.precio) {
                newData.precio = precio;
            }
        }
        
        let stock = window.prompt(`Stock actual: ${product.stock}\nIngrese nuevo stock (deje vacio para no cambiar):`, product.stock);
        if (stock) {
            stock = parseInt(stock);
            if (isNaN(stock)) {
                alert("Stock invalido. Debe ser un numero entero.");
                return;
            }
            if (stock !== product.stock) {
                newData.stock = stock;
            }
        }
        
        if (Object.keys(newData).length === 0) {
            alert("No se realizaron cambios.");
            return;
        }
        
        const result = this._model.updateProduct(id, newData);
        alert(result.message);
    }

    deleteProductMenu() {
        let id = parseInt(window.prompt("Ingrese el ID del producto a eliminar:"));
        if (isNaN(id)) {
            alert("ID invalido. Debe ser un numero.");
            return;
        }
        
        if (!this._model.productExists(id)) {
            alert("No existe un producto con ese ID.");
            return;
        }
        
        const confirmDelete = confirm("¿Esta seguro que desea eliminar este producto?");
        if (confirmDelete) {
            const result = this._model.deleteProduct(id);
            alert(result.message);
        } else {
            alert("Operacion cancelada.");
        }
    }

    adjustStockMenu() {
        this.listProducts();
        
        let id = parseInt(window.prompt("Ingrese el ID del producto a ajustar:"));
        if (isNaN(id)) {
            alert("ID invalido. Debe ser un numero.");
            return;
        }
        
        const product = this._model.getProduct(id);
        if (!product) {
            alert("No existe un producto con ese ID.");
            return;
        }
        
        let adjustment = parseInt(window.prompt(
            `Producto: ${product.nombre}\n` +
            `Stock actual: ${product.stock}\n\n` +
            "Ingrese la cantidad a sumar (positivo) o restar (negativo):"
        ));
        
        if (isNaN(adjustment)) {
            alert("Cantidad invalida. Debe ser un numero.");
            return;
        }
        
        const confirmAdjust = confirm(
            `¿Confirmar ajuste de ${adjustment} unidades a ${product.nombre}?\n` +
            `Nuevo stock: ${product.stock + adjustment}`
        );
        
        if (confirmAdjust) {
            const result = this._model.updateProduct(id, {stock: product.stock + adjustment});
            alert(result.message);
        } else {
            alert("Ajuste cancelado.");
        }
    }

    purchaseProductMenu() {
        this.listProducts();
        
        let id = parseInt(window.prompt("Ingrese el ID del producto a comprar:"));
        if (isNaN(id)) {
            alert("ID invalido. Debe ser un numero.");
            return;
        }
        
        const product = this._model.getProduct(id);
        if (!product) {
            alert("No existe un producto con ese ID.");
            return;
        }
        
        if (product.stock <= 0) {
            alert("No hay stock disponible de este producto.");
            return;
        }
        
        let quantity = parseInt(window.prompt(
            `Producto: ${product.nombre}\n` +
            `Precio unitario: $${product.precio.toFixed(2)}\n` +
            `Stock disponible: ${product.stock}\n\n` +
            "Ingrese la cantidad a comprar:"
        ));
        
        if (isNaN(quantity)) {
            alert("Cantidad invalida. Debe ser un numero.");
            return;
        }
        
        if (quantity <= 0) {
            alert("La cantidad debe ser mayor a cero.");
            return;
        }
        
        const confirmPurchase = confirm(
            `¿Confirmar compra de ${quantity} unidades de ${product.nombre}?\n` +
            `Total: $${(quantity * product.precio).toFixed(2)}`
        );
        
        if (confirmPurchase) {
            const result = this._model.purchaseProduct(id, quantity);
            alert(result.message + (result.success ? `\nTotal pagado: $${result.total.toFixed(2)}` : ""));
        } else {
            alert("Compra cancelada.");
        }
    }

    showUserManagementMenu(adminUsername) {
        let exitMenu = false;
        
        while (!exitMenu) {
            let option = window.prompt(
                "Gestion de Usuarios:\n" +
                "1. Listar usuarios\n" +
                "2. Crear nuevo usuario\n" +
                "3. Bloquear/Desbloquear usuario\n" +
                "X. Volver al menu anterior\n\n" +
                "Seleccione una opcion:"
            );

            switch(option) {
                case "1":
                    this.listUsers(adminUsername);
                    break;
                case "2":
                    this.showCreateAccount(adminUsername);
                    break;
                case "3":
                    this.toggleUserLock(adminUsername);
                    break;
                case "X":
                case "x":
                    exitMenu = true;
                    break;
                default:
                    alert("Opcion no valida");
            }
        }
    }

    listUsers(adminUsername) {
        const result = this._model.getAllUsers(adminUsername);
        if (!result.success) {
            alert(result.message);
            return;
        }

        let userList = "Listado de Usuarios:\n\n";
        result.data.forEach(user => {
            userList += `Usuario: ${user.username}\n`;
            userList += `Rol: ${user.role}\n`;
            userList += `Estado: ${user.isLocked ? 'BLOQUEADO' : 'Activo'}\n\n`;
        });
        
        alert(userList);
    }

    toggleUserLock(adminUsername) {
        let username = window.prompt("Ingrese el nombre de usuario a bloquear/desbloquear:");
        if (!username) return;

        const result = this._model.toggleUserLock(username, adminUsername);
        alert(result.message);
    }
}

export { ApplicationUI };