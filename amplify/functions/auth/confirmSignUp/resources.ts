import { defineFunction, secret } from "@aws-amplify/backend";

export const confirmSignUpPostMethodFnc = defineFunction({
    name: 'confirmSignUpPostMethodFnc',
    environment: {
        USER_POOL_CLIENT_ID: "4jn8ensor1j1017kkc2i029mss",
        USER_POOL_ID: secret("USER_POOL_ID")
    }
});