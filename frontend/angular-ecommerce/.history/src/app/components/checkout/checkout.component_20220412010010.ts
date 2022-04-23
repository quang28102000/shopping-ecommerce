import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { start } from 'repl';
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
    console.log(this.checkoutFormGroup.get('customer').value);
  }
  
  copyShippingAddressToBillingAddress(event: Event) {

    const isChecked = (<HTMLInputElement>event.target).checked;

    isChecked ? this.checkoutFormGroup.controls.billingAddress.setValue(this.checkoutFormGroup.controls.shippingAddress.value) 
              :  this.checkoutFormGroup.controls.shippingAddress.reset();
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
    const formGroup = this.checkoutFormGroup.get(formGroupName);
    const countryCode = formGroup.value.country.code;
  }
}
