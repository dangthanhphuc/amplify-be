import { defineFunction, secret } from "@aws-amplify/backend";

export const confirmSignUpPostMethodFnc = defineFunction({
    name: 'confirmSignUpPostMethodFnc',
    environment: {
        USER_POOL_CLIENT_ID: secret("USER_POOL_CLIENT_ID"),
    }
});