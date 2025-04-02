#include <iostream>
#include <unordered_map>

std::unordered_map<std::string, std::string> users = {
    {"juan", "Juan123._"},
    {"enzo", "enzo456"},
};

std::unordered_map<int, std::tuple<std::string, double, int>> inventory = {
    {1, {"Lavandina x 1L", 875.25, 3000}},
    {4, {"Detergente x 500mL", 1102.45, 2010}},
    {22, {"Jabón en polvo x 250g", 650.22, 407}}
};

int validateLogin(std::string& username);
void showMenu(const std::string& username);
bool isValidPassword(const std::string& password);
void changePassword(const std::string& username);
void createAccount();

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

        if (users.find(username) != users.end() && users[username] == password && isValidPassword(password))
        {
            std::cout << "\n¡Bienvenido/a " << username << "!\n" << std::endl;
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
        std::cout << "3) Salir del programa" << std::endl;
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