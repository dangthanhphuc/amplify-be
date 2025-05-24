import { defineFunction, secret } from "@aws-amplify/backend";

export const signInWithRedirectGoogleFnc = defineFunction({
    name: 'signInWithRedirectGoogleFnc',
    environment: {
        COGNITO_DOMAIN: secret("COGNITO_DOMAIN"),
        USER_POOL_CLIENT_ID: secret("USER_POOL_CLIENT_ID"),
    }
});