import { defineFunction, secret } from "@aws-amplify/backend";

export const signInPostMethodFnc = defineFunction({
    name: 'signInPostMethodFnc',
    environment: {
        USER_POOL_CLIENT_ID: String(process.env.USER_POOL_CLIENT_ID),
    }
});