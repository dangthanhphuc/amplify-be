import { defineFunction, secret } from "@aws-amplify/backend";

export const getTokenByCodeFnc = defineFunction({
    name: 'getTokenByCodeFnc',
    environment: {
        COGNITO_DOMAIN: "https://6ebbeb9af207e4b82267.auth.us-east-1.amazoncognito.com",
        // USER_POOL_CLIENT_ID: "4jn8ensor1j1017kkc2i029mss",
    }
});

