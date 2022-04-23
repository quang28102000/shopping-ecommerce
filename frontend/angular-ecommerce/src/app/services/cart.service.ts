import { Injectable } from '@angular/core';
import { CartItem } from '../common/cart-item';
import {BehaviorSubject, ReplaySubject, Subject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  cartItems: CartItem[] = [];
  
  // DEFINITION: It stores the latest value emitted to its consumers, and whenever a new Observer subscribes, it will 
  // immediately receive the "current value" from the BehaviorSubject.
  totalPrice: Subject<number> = new BehaviorSubject<number>(0);
  totalQuantity: Subject<number> = new BehaviorSubject<number>(0);

  // used to read data from session storage
  // NOTE: SessionStorage -> disappears whenever the data is no longer available
  // storage: Storage = sessionStorage;
  storage: Storage = localStorage;
  
  constructor() { 
    
    // read data stored in the storage
    let data = JSON.parse(this.storage.getItem('cartItems'));
    
    // if the storage has the data
    if (data != null) {
      this.cartItems = data;
      
      // compute totals based on the data that is read from the storage
      this.computeCartTotals();
    }
  }

  // stores the cart items into the storage
  persistCartItems() {
    // using JSON.stringify (object to JSON string) since storage can only read the string
    this.storage.setItem('cartItems', JSON.stringify((this.cartItems)));
  }
  
  addToCart(theCartItem: CartItem) {

    // check if we already have the item in our cart
    let alreadyExistsInCart: boolean = false;
    let existingCartItem: CartItem = undefined;

    if (this.cartItems.length > 0) {
      // find the item in the cart based on item id

      existingCartItem = this.cartItems.find( tempCartItem => tempCartItem.id === theCartItem.id );

      // check if we found it
      alreadyExistsInCart = (existingCartItem != undefined);
    }

    if (alreadyExistsInCart) {
      // increment the quantity
      existingCartItem.quantity++;
    }
    else {
      // just add the item to the array
      this.cartItems.push(theCartItem);
    }

    // compute cart total price and total quantity
    this.computeCartTotals();
  }

  computeCartTotals() {

    let totalPriceValue: number = 0;
    let totalQuantityValue: number = 0;

    for (let currentCartItem of this.cartItems) {
      totalPriceValue += currentCartItem.quantity * currentCartItem.unitPrice;
      totalQuantityValue += currentCartItem.quantity;
    }

    // publish the new values ... all subscribers will receive the new data
    this.totalPrice.next(totalPriceValue);
    this.totalQuantity.next(totalQuantityValue);

    // log cart data just for debugging purposes
    this.logCartData(totalPriceValue, totalQuantityValue);
    
    // persist cart data
    this.persistCartItems();
  }

  logCartData(totalPriceValue: number, totalQuantityValue: number) {

    console.log('Contents of the cart');
    for (let tempCartItem of this.cartItems) {
      const subTotalPrice = tempCartItem.quantity * tempCartItem.unitPrice;
      console.log(`name: ${tempCartItem.name}, quantity=${tempCartItem.quantity}, unitPrice=${tempCartItem.unitPrice}, subTotalPrice=${subTotalPrice}`);
    }

    console.log(`totalPrice: ${totalPriceValue.toFixed(2)}, totalQuantity: ${totalQuantityValue}`);
    console.log('----');
  }

  decrementQuantity(theCartItem: CartItem) {
    theCartItem.quantity--;

    // whether remove the item or not
    // case 1: the quantity = 0 -> remove
    theCartItem.quantity === 0 ? this.remove(theCartItem) : this.computeCartTotals();
  }

  remove(theCartItem: CartItem) {

    // find the index of the object in the array
    const itemIndex = this.cartItems.findIndex(cartItem => cartItem.id === theCartItem.id);

    // if the object is existed in the array
    if (itemIndex > -1) {
      
      // splice(<start>, <0: add, 1: replace>)
      // in this case, 1 without alternative one -> delete
      this.cartItems.splice(itemIndex, 1);
      this.computeCartTotals();
    }
  }

}
