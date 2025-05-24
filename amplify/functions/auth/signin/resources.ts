import { defineFunction, secret } from "@aws-amplify/backend";

export const signInPostMethodFnc = defineFunction({
    name: 'signInPostMethodFnc',
    environment: {
        USER_POOL_CLIENT_ID: secret("USER_POOL_CLIENT_ID"),
    }
});