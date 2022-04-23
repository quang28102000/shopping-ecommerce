import { Injectable } from '@angular/core';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from "@angular/common/http";
import {OktaAuthService} from "@okta/okta-angular";
import {from, Observable} from "rxjs";
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class AuthInterceptorService implements HttpInterceptor{

  constructor(private oktaAuth: OktaAuthService) { }
  
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return from(this.handleAccess(req, next));
  }
  
  private async handleAccess(request: HttpRequest<any>, next: HttpHandler): Promise<HttpEvent<any>> {
    const theEndpoint = `${environment.ecommerceShopApiUrl}/orders`
    // add an access token for secured endpoints
    const securedEndpoints = [theEndpoint];
    
    // checked whether secured endpoints are in the current URL (HttpRequest) that the user is making a call for
    if (securedEndpoints.some(url => request.urlWithParams.includes(url))) {
      
      // wait an async call to finish
      const accessToken = await this.oktaAuth.getAccessToken(); 
    
      // clone the request and set new header with the access token
      // we have to clone the request cuz it's immutable
      request = request.clone({
        setHeaders: {
          Authorization: 'Bearer ' + accessToken
        }
      });
    }
    // pass the request to the next interceptor in the chain
    return next.handle(request).toPromise();
  }
}
