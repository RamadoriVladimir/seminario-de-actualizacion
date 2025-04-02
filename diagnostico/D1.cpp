#include <iostream>
#include <unordered_map>

std::unordered_map<std::string, std::string> users = {
    {"juan", "juan123"},
    {"enzo", "enzo456"},
};


int main()
{
    std::string username, password; 
    int logAttempts = 0;
    int maxAttempts = 3;

    while (logAttempts < maxAttempts) 
    {
        std::cout << "Ingrese su nombre de usuario: " << std::endl;
        std::getline(std::cin, username);
        std::cout << "Ingrese su contraseña: " << std::endl;
        std::getline(std::cin, password);

        if (users.find(username) !=users.end() && users[username] == password)
        {
            std::cout << "!Bienvenido/a " << username << "!" << std::endl;
            return 0;
        }
        else
        {
            std::cout << "Usuario y/o contraseña incorrecta." << std::endl;
            logAttempts++;
        };

        if(logAttempts == maxAttempts) 
        {
            std::cout << "Usuario bloqueado. Contacte al administrador. " << std::endl;
        }
    };

return 0;
};
