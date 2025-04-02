#include <iostream>
#include <unordered_map>
#include <tuple>
#include <memory> 

class RoleStrategy {
public:
    virtual ~RoleStrategy() = default;
    virtual bool canManageArticles() const = 0;
    virtual bool canAddArticles() const = 0;
    virtual bool canEditArticles() const = 0;
    virtual bool canDeleteArticles() const = 0;
    virtual bool canBuyArticles() const = 0;
    virtual std::string getRoleName() const = 0;
};

class AdminStrategy : public RoleStrategy {
public:
    bool canManageArticles() const override { return true; }
    bool canAddArticles() const override { return true; }
    bool canEditArticles() const override { return true; }
    bool canDeleteArticles() const override { return true; }
    bool canBuyArticles() const override { return true; }
    std::string getRoleName() const override { return "Administrador"; }
};

class ClientStrategy : public RoleStrategy {
public:
    bool canManageArticles() const override { return true; }
    bool canAddArticles() const override { return false; }
    bool canEditArticles() const override { return false; }
    bool canDeleteArticles() const override { return false; }
    bool canBuyArticles() const override { return true; }
    std::string getRoleName() const override { return "Cliente"; }
};

class WarehouseWorkerStrategy : public RoleStrategy {
public:
    bool canManageArticles() const override { return true; }
    bool canAddArticles() const override { return true; }
    bool canEditArticles() const override { return true; }
    bool canDeleteArticles() const override { return true; }
    bool canBuyArticles() const override { return false; }
    std::string getRoleName() const override { return "Trabajador de deposito"; }
};

std::unordered_map<std::string, std::pair<std::string, std::unique_ptr<RoleStrategy>>> users;

void initializeUsers() {
    users["juan"] = {"Juan123._", std::make_unique<ClientStrategy>()};
    users["enzo"] = {"Enzo456!.", std::make_unique<ClientStrategy>()};
    users["maria"] = {"Maria789.!", std::make_unique<ClientStrategy>()};
    users["admin"] = {"Admin123_!", std::make_unique<AdminStrategy>()};
    users["empleado"] = {"Empleado456!.", std::make_unique<WarehouseWorkerStrategy>()};
}


std::unordered_map<int, std::tuple<std::string, double, int>> inventory = {
    {1, {"Lavandina x 1L", 875.25, 3000}},
    {4, {"Detergente x 500mL", 1102.45, 2010}},
    {22, {"Jabon en polvo x 250g", 650.22, 407}}
};


int validateLogin(std::string& username);
void showMenu(const std::string& username, RoleStrategy* roleStrategy);
bool isValidPassword(const std::string& password);
void changePassword(const std::string& username);
void createAccount();
void manageArticles(RoleStrategy* roleStrategy);
void listArticles();
void addArticle(RoleStrategy* roleStrategy);
void editArticle(RoleStrategy* roleStrategy);
void deleteArticle(RoleStrategy* roleStrategy);
void buyArticle(RoleStrategy* roleStrategy);

int main() {
    initializeUsers();
    
    while (true) {
        int choice;
        std::cout << "\nMenu Principal" << std::endl;
        std::cout << "1) Iniciar sesion" << std::endl;
        std::cout << "2) Crear cuenta de usuario" << std::endl;
        std::cout << "3) Salir" << std::endl;
        std::cout << "Ingrese la opcion deseada: ";
        std::cin >> choice;
        std::cin.ignore();

        std::string username;
        switch (choice) {
        case 1:
            if (validateLogin(username) == 1) {
                showMenu(username, users[username].second.get());
            }
            break;
        case 2:
            createAccount();
            break;
        case 3:
            std::cout << "Saliendo del programa..." << std::endl;
            return 0;
        default:
            std::cout << "Opcion no valida. Intente nuevamente." << std::endl;
        }
    }
}

void showMenu(const std::string& username, RoleStrategy* roleStrategy) {
    int choice;
    do {
        std::cout << "\n\t Menu - Rol: " << roleStrategy->getRoleName() << std::endl;
        std::cout << "1) Cambiar contrasena" << std::endl;
        std::cout << "2) Volver al inicio de sesion" << std::endl;
        
        if (roleStrategy->canManageArticles()) {
            std::cout << "3) Gestionar articulos" << std::endl;
        }
        
        std::cout << "4) Salir del programa" << std::endl;
        std::cout << "Ingrese la opcion deseada: ";
        std::cin >> choice;
        std::cin.ignore();

        switch (choice) {
        case 1:
            changePassword(username);
            break;
        case 2:
            return;
        case 3:
            if (roleStrategy->canManageArticles()) {
                manageArticles(roleStrategy);
            } else {
                std::cout << "No tiene permisos para esta accion." << std::endl;
            }
            break;
        case 4:
            std::cout << "Saliendo del programa..." << std::endl;
            exit(0);
        default:
            std::cout << "Opcion no valida. Intente nuevamente." << std::endl;
        }
    } while (true);
}

void manageArticles(RoleStrategy* roleStrategy) {
    int opcion;
    do {
        std::cout << "\nGestion de Articulos:" << std::endl;
        std::cout << "1) Listar articulos" << std::endl;
        
        if (roleStrategy->canAddArticles()) {
            std::cout << "2) Nuevo articulo" << std::endl;
        }
        
        if (roleStrategy->canEditArticles()) {
            std::cout << "3) Editar articulo" << std::endl;
        }
        
        if (roleStrategy->canDeleteArticles()) {
            std::cout << "4) Eliminar articulo" << std::endl;
        }
        
        if (roleStrategy->canBuyArticles()) {
            std::cout << "5) Comprar un articulo" << std::endl;
        }
        
        std::cout << "6) Volver" << std::endl;
        std::cout << "Seleccione una opcion: ";
        std::cin >> opcion;
        std::cin.ignore();

        switch (opcion) {
        case 1:
            listArticles();
            break;
        case 2:
            if (roleStrategy->canAddArticles()) {
                addArticle(roleStrategy);
            } else {
                std::cout << "No tiene permisos para esta accion." << std::endl;
            }
            break;
        case 3:
            if (roleStrategy->canEditArticles()) {
                editArticle(roleStrategy);
            } else {
                std::cout << "No tiene permisos para esta accion." << std::endl;
            }
            break;
        case 4:
            if (roleStrategy->canDeleteArticles()) {
                deleteArticle(roleStrategy);
            } else {
                std::cout << "No tiene permisos para esta accion." << std::endl;
            }
            break;
        case 5:
            if (roleStrategy->canBuyArticles()) {
                buyArticle(roleStrategy);
            } else {
                std::cout << "No tiene permisos para esta accion." << std::endl;
            }
            break;
        case 6:
            return;
        default:
            std::cout << "Opcion no valida. Intente nuevamente." << std::endl;
        }
    } while (true);
}

void createAccount() {
    std::string newUsername, newPassword, role;

    std::cout << "Ingrese un nombre de usuario: ";
    std::getline(std::cin, newUsername);

    if (users.find(newUsername) != users.end()) {
        std::cout << "El usuario ya existe. Intente con otro nombre." << std::endl;
        return;
    }

    while (true) {
        std::cout << "Ingrese una contrasena: ";
        std::getline(std::cin, newPassword);
        if (isValidPassword(newPassword)) {
            break;
        }
        std::cout << "Intente nuevamente." << std::endl;
    }

    std::cout << "Ingrese el rol (Administrador, Cliente, Vendedor, Trabajador de deposito): ";
    std::getline(std::cin, role);

    if (role == "Administrador") {
        users[newUsername] = {newPassword, std::make_unique<AdminStrategy>()};
    } else if (role == "Cliente") {
        users[newUsername] = {newPassword, std::make_unique<ClientStrategy>()};
    } else if (role == "Trabajador de deposito") {
        users[newUsername] = {newPassword, std::make_unique<WarehouseWorkerStrategy>()};
    } else {
        std::cout << "Rol no valido. Cuenta no creada." << std::endl;
        return;
    }

    std::cout << "Cuenta creada con exito." << std::endl;
}

int validateLogin(std::string& username)
{
    std::string password;
    int logAttempts = 0;
    const int maxAttempts = 3;

    while (logAttempts < maxAttempts)
    {
        std::cout << "Ingrese su nombre de usuario: ";
        std::getline(std::cin, username);
        std::cout << "Ingrese su contrasena: ";
        std::getline(std::cin, password);

        auto it = users.find(username);
        if (it != users.end() && it->second.first == password)
        {
            std::cout << "¡Bienvenido/a " << username << "!\n" << std::endl;
            return 1;
        }
        else
        {
            std::cout << "Credenciales incorrectas o contrasena invalida. Intentos restantes: " << (maxAttempts - ++logAttempts) << "\n";
        }
    }

    std::cout << "Usuario bloqueado. Contacte al administrador." << std::endl;
    std::exit(0);
}

bool isValidPassword(const std::string& password) {
    if (password.length() < 8 || password.length() > 16) {
        return false;
    }

    bool hasUpper = false;
    int special = 0;
    
    for (char ch : password) {
        if (std::isupper(ch)) hasUpper = true;
        if (!std::isalnum(ch)) special++;
        if (hasUpper && special >= 2) break; 
    }

    return hasUpper && special >= 2;
}

void changePassword(const std::string& username)
{
    std::string newPassword;
    bool validPassword = false;

    while (!validPassword)
    {
        std::cout << "Ingrese la nueva contrasena: ";
        std::getline(std::cin, newPassword);

        validPassword = isValidPassword(newPassword);
        if (!validPassword)
        {
            std::cout << "La contrasena no cumple con los requisitos de seguridad. Intentelo de nuevo." << std::endl;
        }
    }

    users[username].first = newPassword;
    std::cout << "Contrasena cambiada con exito." << std::endl;
}

void listArticles()
{
    std::cout << "\nLista de articulos:" << std::endl;
    for (const auto &pair : inventory)
    {
        int id = pair.first;
        auto data = pair.second;
        
        std::string nombre;
        double precio;
        int stock;
        
        std::cout << "ID: " << id << " - " << std::get<0>(data) << " - Precio: $" << std::get<1>(data) << " - Stock: " << std::get<2>(data) << std::endl;
    }
};

void addArticle(RoleStrategy* roleStrategy) {
    if (!roleStrategy->canAddArticles()) {
        std::cout << "No tiene permisos para agregar articulos." << std::endl;
        return;
    }

    int id;
    std::string nombre;
    double precio;
    int stock;
    
    std::cout << "Ingrese el ID del nuevo articulo: ";
    std::cin >> id;
    std::cin.ignore();
    
    if (inventory.find(id) != inventory.end()) {
        std::cout << "El ID ya existe en el inventario." << std::endl;
        return;
    }
    
    std::cout << "Ingrese el nombre del articulo: ";
    std::getline(std::cin, nombre);
    std::cout << "Ingrese el precio del articulo: ";
    std::cin >> precio;
    std::cout << "Ingrese el stock del articulo: ";
    std::cin >> stock;
    
    inventory[id] = {nombre, precio, stock};
    std::cout << "Articulo agregado con exito." << std::endl;
}

void editArticle(RoleStrategy* roleStrategy) {
    if (!roleStrategy->canEditArticles()) {
        std::cout << "No tiene permisos para editar articulos." << std::endl;
        return;
    }

    int id;
    std::cout << "Ingrese el ID del articulo a editar: ";
    std::cin >> id;
    std::cin.ignore();

    if (inventory.find(id) == inventory.end()) {
        std::cout << "Articulo no encontrado." << std::endl;
        return;
    }

    std::string nombre;
    double precio;
    int stock;
    
    std::cout << "Ingrese el nuevo nombre del articulo: ";
    std::getline(std::cin, nombre);
    std::cout << "Ingrese el nuevo precio del articulo: ";
    std::cin >> precio;
    std::cout << "Ingrese el nuevo stock del articulo: ";
    std::cin >> stock;
    
    inventory[id] = {nombre, precio, stock};
    std::cout << "Articulo actualizado con exito." << std::endl;
}

void deleteArticle(RoleStrategy* roleStrategy) {
    if (!roleStrategy->canDeleteArticles()) {
        std::cout << "No tiene permisos para eliminar articulos." << std::endl;
        return;
    }

    int id;
    std::cout << "Ingrese el ID del articulo a eliminar: ";
    std::cin >> id;
    std::cin.ignore();
    
    if (inventory.erase(id)) {
        std::cout << "Articulo eliminado con exito." << std::endl;
    }
    else {
        std::cout << "Articulo no encontrado." << std::endl;
    }
}

void buyArticle(RoleStrategy* roleStrategy) {
    if (!roleStrategy->canBuyArticles()) {
        std::cout << "No tiene permisos para comprar articulos." << std::endl;
        return;
    }

    int id, cantidad;
    std::cout << "Ingrese el ID del articulo a comprar: ";
    std::cin >> id;
    std::cout << "Ingrese la cantidad a comprar: ";
    std::cin >> cantidad;

    if (inventory.find(id) == inventory.end()) {
        std::cout << "Articulo no encontrado." << std::endl;
        return;
    }

    auto& data = inventory[id];
    if (std::get<2>(data) < cantidad) {
        std::cout << "Stock insuficiente." << std::endl;
        return;
    }

    char confirm;
    std::cout << "Confirma la compra de " << cantidad << " unidades de '" << std::get<0>(data) << "'? (s/n): ";
    std::cin >> confirm;

    if (confirm == 's' || confirm == 'S') {
        std::get<2>(data) -= cantidad;
        std::cout << "Compra realizada con exito." << std::endl;
    }
    else {
        std::cout << "Compra cancelada." << std::endl;
    }
}