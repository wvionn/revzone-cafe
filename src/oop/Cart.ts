import { Product } from "./Logic";

// tipe data item di keranjang
export interface CartItem {
    product: Product;
    quantity: number;
}

// class cart (encapsulation)
export class Cart{
    //private property
    #items: CartItem[] = [];

    //method buat nambah item ke cart
    addItem(product: Product): void {
        const existing = this.#items.find(i => i.product.id === product.id);
        if(existing){
            existing.quantity += 1;
        } else{
            this.#items.push({ product, quantity: 1});
        }
    }

    //method buat ngurangin item di cart
    removeItem(productName: string): void {
        const index = this.#items.findIndex(i => i.product.name === productName);
        if(index !== -1){
            if(this.#items[index].quantity > 1){
                this.#items[index].quantity --;
            } else{
                this.#items.splice(index, 1);
            }
        }
    }

    //getter : total harga (logic hitungan dibungkus di sini)
    get totalPrice(): string {
       const total = this.#items.reduce((sum, item) => {
        // delete period in price string and convert to number
        const priceNumber = parseInt(item.product.price.replace(/\./g, ''));
        return sum + (priceNumber * item.quantity);
       }, 0);
       return total.toLocaleString('id-ID');
    }

    //getter : total item
    get totalItems():  number {
        return this.#items.reduce((sum, item) => sum + item.quantity, 0);
    }

    //getter: take all the items (read-only)
    get items(): CartItem[]{
        return [...this.#items];
    }
}