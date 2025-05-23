import { defineFunction } from "@aws-amplify/backend";

export const signUpPostMethodFnc = defineFunction({
    name: 'signUpPostMethodFnc',
    environment: {
        USER_POOL_CLIENT_ID: String(process.env.USER_POOL_CLIENT_ID),
        USER_POOL_ID: String(process.env.USER_POOL_ID),
    }
});

