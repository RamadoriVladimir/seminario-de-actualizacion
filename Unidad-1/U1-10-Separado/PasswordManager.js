class PasswordManager {
    constructor() {
        this.minLength = 8;
        this.maxLength = 16;
        this.minUppercase = 1;
        this.minSpecialChars = 2;
        this.specialChars = '!@#$%^&*()_+-=[]{};\':"\\|,.<>/?';
    }

    isSecurePassword(password) {
        if (password.length < this.minLength || password.length > this.maxLength) {
            return {valid: false, message: `La contraseña debe tener entre ${this.minLength} y ${this.maxLength} caracteres`};
        }

        let upperCaseCount = 0;
        for (let char of password) {
            if (char >= 'A' && char <= 'Z') {
                upperCaseCount++;
            }
        }
        if (upperCaseCount < this.minUppercase) {
            return {valid: false, message: `Debe contener al menos ${this.minUppercase} mayuscula(s)`};
        }

        let specialCharsCount = 0;
        for (let char of password) {
            if (this.specialChars.includes(char)) {
                specialCharsCount++;
            }
        }
        if (specialCharsCount < this.minSpecialChars) {
            return {valid: false, message: `Debe contener al menos ${this.minSpecialChars} caracteres especiales (${this.specialChars})`};
        }

        for (let char of password) {
            const isLowercase = char >= 'a' && char <= 'z';
            const isUppercase = char >= 'A' && char <= 'Z';
            const isNumber = char >= '0' && char <= '9';
            const isSpecialChar = this.specialChars.includes(char);
            
            if (!(isLowercase || isUppercase || isNumber || isSpecialChar)) {
                return {valid: false, message: "Contiene caracteres no permitidos"};
            }
        }

        return {valid: true, message: "Contraseña valida"};
    }
}

export { PasswordManager };