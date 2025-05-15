import { defineFunction, secret } from "@aws-amplify/backend";

export const getTokenByCodeFnc = defineFunction({
    name: 'getTokenByCodeFnc',
    environment: {
        COGNITO_DOMAIN: String(process.env.COGNITO_DOMAIN),
        // USER_POOL_CLIENT_ID: String(process.env.USER_POOL_CLIENT_ID),
    }
});

