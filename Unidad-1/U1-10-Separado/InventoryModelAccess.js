class InventoryModelAccess {
    constructor() {
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
        return {success: true, message: "Producto agregado exitosamente"};
    }

    updateProduct(id, newData) {
        if (!this._inventoryData.has(id)) {
            return {success: false, message: "Producto no encontrado"};
        }
        const product = this._inventoryData.get(id);
        Object.assign(product, newData);
        return {success: true, message: "Producto actualizado exitosamente"};
    }

    deleteProduct(id) {
        if (!this._inventoryData.has(id)) {
            return {success: false, message: "Producto no encontrado"};
        }
        this._inventoryData.delete(id);
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
        return {
            success: true, 
            message: `Compra realizada. Nuevo stock: ${product.stock}`,
            total: quantity * product.precio
        };
    }
}

export { InventoryModelAccess };