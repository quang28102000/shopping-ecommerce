export default {
    
    // clientId: public identifier of client app
    // issuer ~ issuer of tokens: URL when authorizing with Okta Authorization Server
    // redirectUri: send the user to this URI when they logged in
    // scopes: required for authentication requests
    oidc: {
        clientId: '0oa4qixlsmoynnx2Z5d7',
        issuer: 'https://dev-12371589.okta.com/oauth2/default',
        redirectUri: 'https://localhost:4200/login/callback',
        scopes: ['openid', 'profile', 'email']
    }
    
}

