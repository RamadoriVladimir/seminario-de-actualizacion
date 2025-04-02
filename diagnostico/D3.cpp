#include <iostream>
#include <unordered_map>

std::unordered_map<std::string, std::string> users = {
    {"juan", "Juan123._"},
    {"enzo", "enzo456"},
};

int validateLogin(std::string username);
void showMenu(const std::string& username);
bool isValidPassword(const std::string& password);
void changePassword(const std::string& username);

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

int validateLogin(std::string username)
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

        if (users.find(username) != users.end())
        {
            if (users[username] == password && isValidPassword(password))
            {
                std::cout << "\n¡Bienvenido/a " << username << "!\n" << std::endl;
                return 0; 
            }
            else
            {
                std::cout << "Contraseña invalida. Asegurese de que cumple con los requisitos de seguridad.\n";
                logAttempts++;
                std::cout << "Intentos restantes: " << (maxAttempts - logAttempts) << "\n";
            }
        }
        else
        {
            logAttempts++;
            std::cout << "Usuario no encontrado. Intentos restantes: " << (maxAttempts - logAttempts) << "\n";
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
        std::cout << "1) Cambiar contraseña" << std::endl;
        std::cout << "2) Volver al inicio de sesion" << std::endl;
        std::cout << "3) Salir del programa" << std::endl;
        std::cout << "Ingrese la opcion deseada: ";
        std::cin >> choice;
        std::cin.ignore(); 

        switch (choice)
        {
        case 1:
        {
            changePassword(username);
            break;
        }
        case 2:
            std::cout << "Regresando al inicio de sesion...\n";
            return; 
        case 3:
            std::cout << "Saliendo del programa...\n";
            exit(0);
        default:
            std::cout << "Opcion no válida. Intente nuevamente.\n";
        }
    } while (true);
};

bool isValidPassword(const std::string& password)
{
    bool hasUpperCase = false;
    bool hasSpecialChars = false;
    int specialCharCount = 0;

    if(password.length() <8 || password.length() >16 )
    {
        std::cout << "La contraseña debe tener entre 8 y 16 caracteres.\n";
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

    if (!hasUpperCase)
    {
        std::cout << "La contraseña debe contener al menos una letra mayuscula.\n";
        return false;
    }

    if (specialCharCount < 2)
    {
        std::cout << "La contraseña debe contener al menos 2 simbolos especiales.\n";
        return false;
    }

    return true;
};

void changePassword(const std::string& username)
{
    std::string newPassword;
    bool validPassword = false;

    while (!validPassword)
    {
        std::cout << "Ingrese la nueva contraseña: ";
        std::getline(std::cin, newPassword);

        validPassword = isValidPassword(newPassword);

        if (!validPassword)
        {
            std::cout << "La contraseña no cumple con los requisitos de seguridad. Intentelo de nuevo.\n";
        }
    }

    users[username] = newPassword;
    std::cout << "Contraseña cambiada con éxito.\n";
}