import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Country } from 'src/app/common/country';
import { State } from 'src/app/common/state';
import { CheckoutFormService } from 'src/app/services/checkout-form.service';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {

  checkoutFormGroup: FormGroup;
  shippingAddressStates: State[] = [];
  billingAddressStates: State[] = [];

  totalPrice: number = 0;
  totalQuantity: number = 0;

  creditCardYears: number[] = [];
  creditCardMonths: number[] = [];

  countries: Country[] = [];

  constructor(private formBuilder: FormBuilder, 
              private checkoutFormService: CheckoutFormService) { }

  ngOnInit(): void {
    this.checkoutFormGroup = this.formBuilder.group({
      customer: this.formBuilder.group(
        {
          firstName: new FormControl('', [Validators.required, Validators.minLength(2)]),
          lastName: new FormControl('', [Validators.required, Validators.minLength(2)]),
          email: new FormControl('',
          [ Validators.required, Validators.pattern(
            '^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$'
          )]
          )
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
    });

    // BY DEFAULT: the month would be started at the month of the current year                       
    // populate credit card months
    // +1 since JS Data object the months are 0-based
    const startMonth: number = new Date().getMonth() + 1; 
    console.log(`startMonth: ${startMonth}`);

    this.checkoutFormService.getCreditCardMonths(startMonth).subscribe(
      data => {
        console.log(`Retrieved credit card months: ${JSON.stringify(data)}`);
        this.creditCardMonths = data;
      }
    );

    // populate credit card years
    this.checkoutFormService.getCreditCardYears().subscribe(
      data => {
        console.log(`Retrieved credit card years: ` + JSON.stringify(data));
        this.creditCardYears = data; 
      }
    );

    // populate countries
    this.checkoutFormService.getCountries().subscribe(
      data => {
        console.log(`Retrieved countries: ${JSON.stringify(data)}`);
        this.countries = data;
      }
    )
  }

  onSubmit() {
    console.log(`Handling the submit button`);

    if (this.checkoutFormGroup.invalid) {
      this.checkoutFormGroup.markAllAsTouched();
    }
    console.log(this.checkoutFormGroup.get('customer').value);
    console.log(`The email address is ${this.checkoutFormGroup.get('customer').value.email}`);
    console.log(`The shipping address country is ${this.checkoutFormGroup.get('shippingAddress').value.country.name}`);
    console.log(`The shipping address states is ${this.checkoutFormGroup.get('shippingAddress').value.state.name}`);
  }

get firstName() {
  return this.checkoutFormGroup.get('customer.firstName');
}  

get lastName() {
  return this.checkoutFormGroup.get('customer.lastName');
}

get email() {
  return this.checkoutFormGroup.get('customer.email')
}

  copyShippingAddressToBillingAddress(event: Event) {

    const isChecked = (<HTMLInputElement>event.target).checked;

    isChecked ? 
    ((this.checkoutFormGroup.controls.billingAddress.setValue(this.checkoutFormGroup.controls.shippingAddress.value)), 
    this.billingAddressStates = this.shippingAddressStates) 
    : (this.checkoutFormGroup.controls.shippingAddress.reset(),this.billingAddressStates = [])
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
}
