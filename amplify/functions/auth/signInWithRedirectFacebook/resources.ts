import { defineFunction, secret } from "@aws-amplify/backend";

export const signInWithRedirectFacebookFnc = defineFunction({
    name: 'signInWithRedirectFacebookFnc',
    environment: {
        USER_POOL_CLIENT_ID: secret("USER_POOL_CLIENT_ID"),
        COGNITO_DOMAIN: secret("COGNITO_DOMAIN"),
        CALLBACK_URL: secret("CALLBACK_URL")
    }
});

