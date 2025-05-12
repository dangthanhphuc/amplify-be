import { defineFunction, secret } from "@aws-amplify/backend";

export const signUpPostMethodFnc = defineFunction({
    name: 'signUpPostMethodFnc',
    environment: {
        USER_POOL_CLIENT_ID: secret("USER_POOL_CLIENT_ID"),
    }
});

