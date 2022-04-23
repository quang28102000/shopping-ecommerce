import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {

  checkoutFormGroup: FormGroup;

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
      creditCart: this.formBuilder.group(
        {
          cartType: [''],
          nameOnCard: [''],
          cardNumber: [''],
          securityCode: [''],
          expirationMonth: ['']
        }
      )
    })
  }

  onSubmit() {
    console.log(`Handling the submit button`);
    console.log(this.checkoutFormGroup.get('customer').value);
  }
  
  copyShippingAddressToBillingAddress(event: Event) {
    if((<HTMLInputElement>event.target).checked) {
      this.checkoutFormGroup.controls.billingAddress.setValue(
        this.checkoutFormGroup.controls.shippingAddress.value
      )
    }
  }
}
