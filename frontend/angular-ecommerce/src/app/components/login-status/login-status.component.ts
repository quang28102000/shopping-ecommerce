import { Component, OnInit } from '@angular/core';
import {OktaAuthService} from "@okta/okta-angular";

@Component({
  selector: 'app-login-status',
  templateUrl: './login-status.component.html',
  styleUrls: ['./login-status.component.css']
})
export class LoginStatusComponent implements OnInit {

  // using sessionStorage to keep the user's email
  storage: Storage = sessionStorage;
  
  isAuthenticated: boolean = false;
  userFullName: string; 
  
  constructor(private oktaAuthService: OktaAuthService) { }

  ngOnInit(): void {
    
    // Subscribe to authentication state changes
    this.oktaAuthService.$authenticationState.subscribe((
        (result) => {
          this.isAuthenticated = result;
          this.getUserDetails();
        }
    ))
    
  }

  getUserDetails() {
    if(this.isAuthenticated) {
      // Fetch the logged in user details
      this.oktaAuthService.getUser().then(
          res => {
            this.userFullName = res.name;
            
            // retrieving the user's email from authentication response
            const theEmail = res.email;
            
            // stores the emails in browser storage
            this.storage.setItem('userEmail', JSON.stringify(theEmail));
          }
      )
    }
  }
  
  logout() {
    
    // terminates the session with Okta and removes current tokens
    this.oktaAuthService.signOut();
    
  }
  
}
