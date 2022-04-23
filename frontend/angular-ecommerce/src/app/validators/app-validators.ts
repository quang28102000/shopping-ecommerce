import {FormControl, ValidationErrors} from "@angular/forms";

export class AppValidators {
    // whitespace validation
    static notOnlyWhitespace(control: FormControl): ValidationErrors {
        if ((control.value != null) && (control.value.trim().length === 0)) {
            // if the input is full of spaces and after trimming, the length is 0 --> invalid
            // notOnlyWhitespace is validation error key
            return { notOnlyWhitespace: true};
        } else {
            // valid input fromt the user
            return null;
        }
    }
}
