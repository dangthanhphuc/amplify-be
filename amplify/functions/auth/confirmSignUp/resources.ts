import { defineFunction, secret } from "@aws-amplify/backend";

export const confirmSignUpPostMethodFnc = defineFunction({
    name: 'confirmSignUpPostMethodFnc',
    environment: {
        USER_POOL_CLIENT_ID: String(process.env.USER_POOL_CLIENT_ID),
        USER_POOL_ID: String(process.env.USER_POOL_ID)
    }
});