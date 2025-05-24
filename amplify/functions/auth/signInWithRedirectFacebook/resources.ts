import { defineFunction, secret } from "@aws-amplify/backend";

export const signInWithRedirectFacebookFnc = defineFunction({
    name: 'signInWithRedirectFacebookFnc',
    environment: {
        COGNITO_DOMAIN: secret("COGNITO_DOMAIN"),
        USER_POOL_CLIENT_ID: secret("USER_POOL_CLIENT_ID"),
    }
});

