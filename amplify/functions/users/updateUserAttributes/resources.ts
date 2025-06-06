import { defineFunction, secret } from "@aws-amplify/backend";

export const updateUserAttributesFnc = defineFunction({
    name: "updateUserAttributesFnc",
    timeoutSeconds: 30,
    environment: {
        USER_POOL_ID: secret("USER_POOL_ID"),
    }
});