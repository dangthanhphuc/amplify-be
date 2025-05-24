import { defineFunction, secret } from "@aws-amplify/backend";

export const signInPostMethodFnc = defineFunction({
    name: 'signInPostMethodFnc',
    environment: {
        USER_POOL_CLIENT_ID: "4jn8ensor1j1017kkc2i029mss",
    }
});