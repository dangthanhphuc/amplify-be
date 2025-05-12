import { defineFunction, secret } from "@aws-amplify/backend";

export const getTokenByCodeFnc = defineFunction({
    name: 'getTokenByCodeFnc',
    environment: {
        USER_POOL_CLIENT_ID: secret("USER_POOL_CLIENT_ID"),
        COGNITO_DOMAIN: secret("COGNITO_DOMAIN"),
        CALLBACK_URL: secret("CALLBACK_URL")
    }
});

