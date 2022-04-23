import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {Country} from 'src/app/common/country';
import {State} from 'src/app/common/state';
import {CheckoutFormService} from 'src/app/services/checkout-form.service';
import {AppValidators} from "../../validators/app-validators";
import {CartService} from "../../services/cart.service";
import {CheckoutService} from "../../services/checkout.service";
import {Router} from "@angular/router";
import {Order} from "../../common/order";
import {OrderItem} from "../../common/order-item";
import {Purchase} from "../../common/purchase";
import {environment} from "../../../environments/environment";
import {PaymentInfo} from "../../common/payment-info";

@Component({
    selector: 'app-checkout',
    templateUrl: './checkout.component.html',
    styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {
    
    // for the submit button to prevent sending null form
    isDisabled: boolean = false;
    
    checkoutFormGroup: FormGroup;
    shippingAddressStates: State[] = [];
    billingAddressStates: State[] = [];

    totalPrice: number = 0;
    totalQuantity: number = 0;

    creditCardYears: number[] = [];
    creditCardMonths: number[] = [];

    countries: Country[] = [];

    storage: Storage = sessionStorage;
    
    // initialize Stripe API
    stripe: typeof Stripe = Stripe(environment.stripePublishableKey);
    paymentInfo: PaymentInfo = new PaymentInfo();
    cardElement: any;
    displayError: any = "";
    
    constructor(private formBuilder: FormBuilder,
                private checkoutFormService: CheckoutFormService,
                private cartService: CartService,
                private checkoutService: CheckoutService,
                private router: Router) {
    }

    ngOnInit(): void {
        
        this.setupStripePaymentForm();
        
        this.reviewCartDetails();
        
        // read the user's email address from browser storage
        const theEmail = JSON.parse(this.storage.getItem('userEmail'));
        
        this.checkoutFormGroup = this.formBuilder.group({
            customer: this.formBuilder.group(
                {
                    // FormControl extends the AbstractControl
                    // NgModel mirrors many of the properties of its underlying FormControl instance,
                    // so you can use this in the template to check for control states such as VALID (boolean) and DIRTY (boolean)
                    firstName: new FormControl(
                        '',
                        [
                            Validators.required,
                            Validators.minLength(2),
                            AppValidators.notOnlyWhitespace
                        ]),
                    lastName: new FormControl(
                        '',
                        [
                            Validators.required,
                            Validators.minLength(2),
                            AppValidators.notOnlyWhitespace]),
                    email: new FormControl(theEmail,
                        [Validators.required, Validators.pattern(
                            '^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$'
                        )]
                    )
                }
            ),
            shippingAddress: this.formBuilder.group(
                {
                    street: new FormControl('', [
                        Validators.required,
                        Validators.minLength(2),
                        AppValidators.notOnlyWhitespace
                    ]),
                    city: new FormControl('', [
                        Validators.required,
                        Validators.minLength(2),
                        AppValidators.notOnlyWhitespace
                    ]),
                    state: new FormControl('', Validators.required),
                    country: new FormControl('', Validators.required),
                    zipCode: new FormControl('', [
                        Validators.required,
                        Validators.minLength(2),
                        AppValidators.notOnlyWhitespace
                    ])
                }
            ),
            billingAddress: this.formBuilder.group(
                {
                    country: new FormControl('', [Validators.required]),
                    street: new FormControl('', 
                        [
                            Validators.required,
                            Validators.minLength(2),
                            AppValidators.notOnlyWhitespace
                        ]),
                    city: new FormControl('', [
                        Validators.required,
                        Validators.minLength(2),
                        AppValidators.notOnlyWhitespace
                    ]),
                    state: new FormControl('', [
                        Validators.required
                    ]),
                    zipCode: new FormControl('', [
                        Validators.required,
                        Validators.minLength(2),
                        AppValidators.notOnlyWhitespace
                    ])
                }
            ),
            creditCard: this.formBuilder.group(
                { /*
                    cardType: new FormControl('', [
                        Validators.required
                    ]),
                    nameOnCard: new FormControl('', [
                        Validators.required,
                        Validators.minLength(2),
                        AppValidators.notOnlyWhitespace
                    ]),
                    cardNumber: new FormControl('', [
                        Validators.required,
                        Validators.pattern('[0-9]{16}')
                    ]),
                    securityCode: new FormControl('', [
                        Validators.required,
                        Validators.pattern('[0-9]{3}')
                    ]),
                    expirationMonth: [''],
                    expirationYear: ['']
                    */
                }
            )
        });

        // BY DEFAULT: the month would be started at the month of the current year                       
        // populate credit card months
        // +1 since JS Data object the months are 0-based
        // const startMonth: number = new Date().getMonth() + 1;
        // console.log(`startMonth: ${startMonth}`);
        //
        // this.checkoutFormService.getCreditCardMonths(startMonth).subscribe(
        //     data => {
        //         console.log(`Retrieved credit card months: ${JSON.stringify(data)}`);
        //         this.creditCardMonths = data;
        //     }
        // );
        //
        // // populate credit card years
        // this.checkoutFormService.getCreditCardYears().subscribe(
        //     data => {
        //         console.log(`Retrieved credit card years: ` + JSON.stringify(data));
        //         this.creditCardYears = data;
        //     }
        // );

        // populate countries
        // this.checkoutFormService.getCountries().subscribe(
        //     data => {
        //         console.log(`Retrieved countries: ${JSON.stringify(data)}`);
        //         this.countries = data;
        //     }
        // )
    }

    onSubmit() {
        console.log(`Handling the submit button`);

        if (this.checkoutFormGroup.invalid) {
            this.checkoutFormGroup.markAllAsTouched();
            return;
        }
        
        // set up order
        let order = new Order();
        order.totalPrice = this.totalPrice;
        order.totalQuantity = this.totalQuantity;
        
        // get cart items
        const cartItems = this.cartService.cartItems;
        
        // create orderItems from cartItems
        let orderItems: OrderItem[] = cartItems.map(tempCartItem => new OrderItem(tempCartItem));
        
        // set up purchase
        let purchase = new Purchase();
        
        // populate purchase ~ customer
        purchase.customer = this.checkoutFormGroup.controls['customer'].value;
        
        // populate purchase ~ shipping address
        purchase.shippingAddress = this.checkoutFormGroup.controls['shippingAddress'].value;
        const shippingState: State = JSON.parse(JSON.stringify(purchase.shippingAddress.state))
        const shippingCountry: Country = JSON.parse(JSON.stringify(purchase.shippingAddress.country));
        
        purchase.shippingAddress.state = shippingState.name;
        purchase.shippingAddress.country = shippingCountry.name;
        
        // populate purchase ~ billing address
        purchase.billingAddress = this.checkoutFormGroup.controls['billingAddress'].value;
        const billingState: State = JSON.parse(JSON.stringify(purchase.billingAddress.state))
        const billingCountry: Country = JSON.parse(JSON.stringify(purchase.billingAddress.country));

        purchase.billingAddress.state = billingState.name;
        purchase.billingAddress.country = billingCountry.name;
        
        // populate purchase ~ order and orderItems
        purchase.order = order;
        purchase.orderItems = orderItems;
        
        // compute payment info
        this.paymentInfo.amount = Math.round(this.totalPrice * 100);
        this.paymentInfo.currency = "USD";
        
        // send info to customer's email
        this.paymentInfo.receiptEmail = purchase.customer.email;
        
        // formValid?
        // create payment intent -> confirm card payment -> place order
        // subscribe part: proceed to create a payment intent including products, prices, etc. and payment method sent directly to stripe.com server
        if (!this.checkoutFormGroup.invalid && this.displayError.textContent === "") {
            
            // before REST API called, set the field to true
            this.isDisabled = true;
            
            this.checkoutService.createPaymentIntent(this.paymentInfo).subscribe(
                (paymentIntentResponse) => {
                    // confirm card payment
                    this.stripe.confirmCardPayment(paymentIntentResponse.client_secret, {
                            payment_method: {
                                // reference the Stripe Elements component: cardElement
                                card: this.cardElement,
                                billing_details: {
                                    email: purchase.customer.email,
                                    name: `${purchase.customer.firstName} ${purchase.customer.lastName}`,
                                    address: {
                                        line1: purchase.billingAddress.street,
                                        city: purchase.billingAddress.city,
                                        state: purchase.billingAddress.state,
                                        postal_code: purchase.billingAddress.zipCode,
                                        country: this.billingAddressCountry.value.code
                                    }
                                }
                            }
                        }, { handleActions: false })
                        .then(function(result) {
                            if (result.error) {
                                // inform the customer there was an error
                                alert(`There was an error: ${result.error.message}`);
                                this.isDisabled = false;
                                
                            } else {
                                // call REST API via the CheckoutService
                                this.checkoutService.placeOrder(purchase).subscribe({
                                    next: response => {
                                        alert(`Your order has been received.\nOrder tracking number: ${response.orderTrackingNumber}`);
                                        // reset cart
                                        this.resetCart();
                                        this.isDisabled = false;
                                    },
                                    error: err => {
                                        alert(`There was an error: ${err.message}`);
                                        this.isDisabled = false;
                                    }
                                })
                            }
                        }.bind(this));
                }
            );
        } else {
            this.checkoutFormGroup.markAllAsTouched();
            return;
        }
        
        console.log(this.checkoutFormGroup.get('customer').value);
        console.log(`The email address is ${this.checkoutFormGroup.get('customer').value.email}`);
        console.log(`The shipping address country is ${this.checkoutFormGroup.get('shippingAddress').value.country.name}`);
        console.log(`The shipping address states is ${this.checkoutFormGroup.get('shippingAddress').value.state.name}`);
    }

//  CUSTOMER'S GETTER
    get firstName() {
        return this.checkoutFormGroup.get('customer.firstName');
    };

    get lastName() {
        return this.checkoutFormGroup.get('customer.lastName');
    };

    get email() {
        return this.checkoutFormGroup.get('customer.email')
    };

    // SHIPPING ADDRESS'S GETTER
    get shippingAddressStreet() {
        return this.checkoutFormGroup.get('shippingAddress.street')
    };

    get shippingAddressCity() {
        return this.checkoutFormGroup.get('shippingAddress.city')
    };

    get shippingAddressState() {
        return this.checkoutFormGroup.get('shippingAddress.state')
    };

    get shippingAddressCountry() {
        return this.checkoutFormGroup.get('shippingAddress.country')
    };

    get shippingAddressZipCode() {
        return this.checkoutFormGroup.get('shippingAddress.zipCode')
    };
    // BILLING ADDRESS'S GETTER
    get billingAddressStreet() {
        return this.checkoutFormGroup.get('billingAddress.street')
    };

    get billingAddressCity() {
        return this.checkoutFormGroup.get('billingAddress.city')
    };

    get billingAddressState() {
        return this.checkoutFormGroup.get('billingAddress.state')
    };

    get billingAddressCountry() {
        return this.checkoutFormGroup.get('billingAddress.country')
    };

    get billingAddressZipCode() {
        return this.checkoutFormGroup.get('billingAddress.zipCode')
    }; 
    
    // CREDIT CARD'S GETTER
    get creditCardType() {
        return this.checkoutFormGroup.get('creditCard.cardType');
    }

    get creditCardNameOnCard() {
        return this.checkoutFormGroup.get('creditCard.nameOnCard');
    }

    get creditCardNumber() {
        return this.checkoutFormGroup.get('creditCard.cardNumber');
    }

    get creditCardSecurityCode() {
        return this.checkoutFormGroup.get('creditCard.securityCode');
    }
    
    copyShippingAddressToBillingAddress(event: Event) {

        const isChecked = (<HTMLInputElement>event.target).checked;

        isChecked ?
            ((this.checkoutFormGroup.controls.billingAddress.setValue(this.checkoutFormGroup.controls.shippingAddress.value)),
                this.billingAddressStates = this.shippingAddressStates)
            : (this.checkoutFormGroup.controls.shippingAddress.reset(), this.billingAddressStates = [])
    }

    handleMonthsAndYears() {
        const creditCardFormGroup = this.checkoutFormGroup.get('creditCard');

        const currentYear: number = new Date().getFullYear();
        const selectedYear: number = +(creditCardFormGroup.value.expirationYear);

        // currentYear == selected year -> starts with current month
        // ELSE: full months of a year
        let startMonth: number;

        currentYear === selectedYear ? startMonth = new Date().getMonth() + 1 : startMonth = 1;

        this.checkoutFormService.getCreditCardMonths(startMonth).subscribe(
            data => {
                console.log(`Retrieved credit card months: ` + JSON.stringify(data));
                this.creditCardMonths = data;
            }
        );
    }

    getStates(formGroupName: string) {

        // get the form group name so as to get the value of it
        const formGroup = this.checkoutFormGroup.get(formGroupName);

        // get the country code from form group name
        const countryCode = formGroup.value.country.code;
        const countryName = formGroup.value.country.name;

        console.log(`${formGroupName} country code ${countryCode}`);
        console.log(`${formGroupName} country name ${countryName}`);

        // get states based on its country name
        this.checkoutFormService.getStates(countryCode).subscribe(
            data => {
                formGroupName === 'shippingAddress' ?
                    this.shippingAddressStates = data : this.billingAddressStates = data;

                // select the first state in the list of states (~ state: [''])
                formGroup.get('state').setValue(data[0]);
            }
        )
    }
    
    reviewCartDetails() {
        
        // data in CheckoutComponent subscribes to the totalQuantity in CartService
        this.cartService.totalQuantity.subscribe(
            totalQuantity => this.totalQuantity = totalQuantity
        );
        
        // data in CheckoutComponent subscribes to the totalPrice in CartService
        this.cartService.totalPrice.subscribe(
            totalPrice => this.totalPrice = totalPrice
        );
    }

    resetCard() {
        // reset cart data
        this.cartService.cartItems = [];
        this.cartService.totalPrice.next(0);
        this.cartService.totalQuantity.next(0);
        
        // update storage with latest state of the cart (avoid the cart filled with products after checkout and reload the page)
        this.cartService.persistCartItems();
        
        // reset the form data
        this.checkoutFormGroup.reset();
        
        // navigate back to the home page
        this.router.navigateByUrl('/products');
    }

    private setupStripePaymentForm() {
        
        // get a handle to stripe elements
        let elements = this.stripe.elements();
        
        // create a card element while hiding the zipcode field
        this.cardElement = elements.create('card', {hidePostalCode: true});
        
        // add an instance of card UI component into the 'card-element' div
        this.cardElement.mount('#card-element');
        
        // add event binding for the 'change' event on the card element
        this.cardElement.on('change', (event) => {
           
            // get a handle to card-errors element
            this.displayError = document.getElementById('card-errors');
            
            if(event.complete()) {
                this.displayError.textContent = "";
            } else if (event.error) {
                // show validation error to customer
                this.displayError.textContent = event.error.message();
            }
        });
    }
}
