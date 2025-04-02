#include <iostream>
#include <unordered_map>

std::unordered_map<std::string, std::string> users = {
    {"juan", "juan123"},
    {"enzo", "enzo456"},
};

int validateLogin(std::string& username);
void showMenu(const std::string& username);

int main()
{
    while (true)
    {
        std::string username = "";
        int loginResult = validateLogin(username);
        if (loginResult == 0 ) 
        {
            showMenu(username);
        }
        else
        {
            break;
        }
    }
    return 0;
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
        std::cout << "Ingrese su contraseña: ";
        std::getline(std::cin, password);

        if (users.find(username) != users.end() && users[username] == password)
        {
            std::cout << "\n!Bienvenido/a " << username << "!\n" << std::endl;
            return 0;
        }
        else
        {
            logAttempts++;
            std::cout << "Usuario y/o contraseña incorrecta. Intentos restantes: " << (maxAttempts - logAttempts) << "\n";
        }
    };

    std::cout << "Usuario bloqueado. Contacte al administrador." << std::endl;
    return -1;
};

void showMenu(const std::string& username)
{
    int choice;
    do
    {
        std::cout << "\n\t Menu" << std::endl;
        std::cout << "1) Cambiar contraseña" << std::endl;
        std::cout << "2) Volver al inicio de sesión" << std::endl;
        std::cout << "Ingrese la opción deseada: ";
        std::cin >> choice;
        std::cin.ignore(); 

        switch (choice)
        {
        case 1:
        {
            std::string newPassword;
            std::cout << "Ingrese la nueva contraseña: ";
            std::getline(std::cin, newPassword);
            users[username] = newPassword;
            std::cout << "Contraseña cambiada con exito.\n";
            break;
        }
        case 2:
            std::cout << "Regresando al inicio de sesión...\n";
            return; 
        default:
            std::cout << "Opción no válida. Intente nuevamente.\n";
        }
    } while (true);
};