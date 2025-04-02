#include <iostream>
#include <unordered_map>

std::unordered_map<std::string, std::string> users = {
    {"juan", "Juan123._"},
    {"enzo", "enzo456"},
};

std::unordered_map<int, std::tuple<std::string, double, int>> inventory = {
    {1, {"Lavandina x 1L", 875.25, 3000}},
    {4, {"Detergente x 500mL", 1102.45, 2010}},
    {22, {"Jabon en polvo x 250g", 650.22, 407}}
};

int validateLogin(std::string& username);
void showMenu(const std::string& username);
bool isValidPassword(const std::string& password);
void changePassword(const std::string& username);
void createAccount();

void manageArticles();
void listArticles();
void addArticle();
void editArticle();
void deleteArticle();
void buyArticle();


int main()
{
    while (true)
    {
        int choice;
        std::cout << "\nMenu Principal" << std::endl;
        std::cout << "1) Iniciar sesion" << std::endl;
        std::cout << "2) Crear cuenta de usuario" << std::endl;
        std::cout << "3) Salir" << std::endl;
        std::cout << "Ingrese la opcion deseada: ";
        std::cin >> choice;
        std::cin.ignore();

        std::string username;
        switch (choice)
        {
        case 1:
            if (validateLogin(username) == 0)
            {
                showMenu(username);
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

        if (users.find(username) != users.end() && users[username] == password)
        {
            std::cout << "¡Bienvenido/a " << username << "!\n" << std::endl;
            return 0;
        }
        else
        {
            std::cout << "Credenciales incorrectas o contrasena invalida. Intentos restantes: " << (maxAttempts - ++logAttempts) << "\n";
        }
    }

    std::cout << "Usuario bloqueado. Contacte al administrador." << std::endl;
    return -1;
}

void showMenu(const std::string& username)
{
    int choice;
    do
    {
        std::cout << "\n\t Menu" << std::endl;
        std::cout << "1) Cambiar contrasena" << std::endl;
        std::cout << "2) Volver al inicio de sesion" << std::endl;
        std::cout << "3) Gestionar articulos" << std::endl;
        std::cout << "4) Salir del programa" << std::endl;
        std::cout << "Ingrese la opcion deseada: ";
        std::cin >> choice;
        std::cin.ignore();

        switch (choice)
        {
        case 1:
            changePassword(username);
            break;
        case 2:
            return;
        case 3:
            manageArticles();
        case 4:
            std::cout << "Saliendo del programa..." << std::endl;
            exit(0);
        default:
            std::cout << "Opcion no valida. Intente nuevamente." << std::endl;
        }
    } while (true);
}

bool isValidPassword(const std::string& password)
{
    bool hasUpperCase = false;
    int specialCharCount = 0;

    if (password.length() < 8 || password.length() > 16)
    {
        std::cout << "La contrasena debe tener entre 8 y 16 caracteres." << std::endl;
        return false;
    }

    for (char ch : password)
    {
        if (std::isupper(ch))
        {
            hasUpperCase = true;
        }
        if (!std::isalnum(ch))
        {
            specialCharCount++;
        }
    }

    if (!hasUpperCase || specialCharCount < 2)
    {
        std::cout << "La contrasena debe contener al menos una letra mayuscula y al menos 2 simbolos especiales." << std::endl;
        return false;
    }

    return true;
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

    users[username] = newPassword;
    std::cout << "Contrasena cambiada con exito." << std::endl;
}

void createAccount()
{
    std::string newUsername, newPassword;

    std::cout << "Ingrese un nombre de usuario: ";
    std::getline(std::cin, newUsername);

    if (users.find(newUsername) != users.end())
    {
        std::cout << "El usuario ya existe. Intente con otro nombre." << std::endl;
        return;
    }

    while (true)
    {
        std::cout << "Ingrese una contrasena: ";
        std::getline(std::cin, newPassword);
        if (isValidPassword(newPassword))
        {
            break;
        }
        std::cout << "Intente nuevamente." << std::endl;
    }

    users[newUsername] = newPassword;
    std::cout << "Cuenta creada con exito." << std::endl;
}


void manageArticles()
{
    int opcion;
    do
    {
        std::cout << "\nGestion de Articulos:" << std::endl;
        std::cout << "1) Listar articulos" << std::endl;
        std::cout << "2) Nuevo articulo" << std::endl;
        std::cout << "3) Editar articulo" << std::endl;
        std::cout << "4) Eliminar articulo" << std::endl;
        std::cout << "5) Comprar un articulo" << std::endl;
        std::cout << "6) Volver" << std::endl;
        std::cout << "Seleccione una opcion: ";
        std::cin >> opcion;
        std::cin.ignore();

        switch (opcion)
        {
        case 1:
            listArticles();
            break;
        case 2:
            addArticle();
            break;
        case 3:
            editArticle();
            break;
        case 4:
            deleteArticle();
            break;
        case 5:
            buyArticle();
            break;
        case 6:
            return;
        default:
            std::cout << "Opcion no valida. Intente nuevamente." << std::endl;
        }
    } while (true);
};

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

void addArticle()
{
    int id;
    std::string nombre;
    double precio;
    int stock;
    
    std::cout << "Ingrese el ID del nuevo articulo: ";
    std::cin >> id;
    std::cin.ignore();
    
    if (inventory.find(id) != inventory.end())
    {
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
};

void editArticle()
{
    int id;
    std::cout << "Ingrese el ID del articulo a editar: ";
    std::cin >> id;
    std::cin.ignore();

    if (inventory.find(id) == inventory.end())
    {
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
};

void deleteArticle()
{
    int id;
    std::cout << "Ingrese el ID del articulo a eliminar: ";
    std::cin >> id;
    std::cin.ignore();
    
    if (inventory.erase(id))
    {
        std::cout << "Articulo eliminado con exito." << std::endl;
    }
    else
    {
        std::cout << "Articulo no encontrado." << std::endl;
    }
};

void buyArticle()
{
    int id, cantidad;
    std::cout << "Ingrese el ID del articulo a comprar: ";
    std::cin >> id;
    std::cout << "Ingrese la cantidad a comprar: ";
    std::cin >> cantidad;

    if (inventory.find(id) == inventory.end())  
    {
        std::cout << "Articulo no encontrado." << std::endl;
        return;  
    }

    auto& data = inventory[id];

    if (std::get<2>(data) < cantidad)  
    {
        std::cout << "Stock insuficiente." << std::endl;
        return;  
    }

    char confirm;
    std::cout << "Confirma la compra de " << cantidad << " unidades de '" << std::get<0>(data) << "'? (s/n): ";
    std::cin >> confirm;

    if (confirm == 's' || confirm == 'S')
    {
        std::get<2>(data) -= cantidad;
        std::cout << "Compra realizada con exito." << std::endl;
    }
    else
    {
        std::cout << "Compra cancelada." << std::endl;
    }
};