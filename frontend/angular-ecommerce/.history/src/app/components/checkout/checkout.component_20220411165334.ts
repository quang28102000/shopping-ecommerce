import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {

  checkoutFormGroup: FormGroup;

  totalPrice: number = 0;
  totalQuantity: number = 0;

  creditCardYears: number[] = [];
  creditCardMonths: number[] = [];
  constructor(private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    this.checkoutFormGroup = this.formBuilder.group({
      customer: this.formBuilder.group(
        {
          firstName: [''],
          lastName: [''],
          email: ['']
        }
      ),
      shippingAddress: this.formBuilder.group(
        {
          street: [''],
          city: [''],
          state: [''],
          country: [''],
          zipCode: ['']
        }
      ),
      billingAddress: this.formBuilder.group(
        {
          country: [''],
          street: [''],
          city: [''],
          state: [''],
          zipCode: ['']
        }
      ),
      creditCard: this.formBuilder.group(
        {
          cartType: [''],
          nameOnCard: [''],
          cardNumber: [''],
          securityCode: [''],
          expirationMonth: [''],
          expirationYear: ['']
        }
      )
    })
  }

  onSubmit() {
    console.log(`Handling the submit button`);
    console.log(this.checkoutFormGroup.get('customer').value);
  }
  
  copyShippingAddressToBillingAddress(event: Event) {

    const isChecked = (<HTMLInputElement>event.target).checked;

    isChecked ? this.checkoutFormGroup.controls.billingAddress.setValue(this.checkoutFormGroup.controls.shippingAddress.value) 
              :  this.checkoutFormGroup.controls.shippingAddress.reset();
  }
}
