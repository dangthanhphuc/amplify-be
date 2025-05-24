import { defineFunction, secret } from "@aws-amplify/backend";

export const signUpPostMethodFnc = defineFunction({
    name: 'signUpPostMethodFnc',
    environment: {
        USER_POOL_CLIENT_ID: secret("USER_POOL_CLIENT_ID"),
        // USER_POOL_ID: String(process.env.USER_POOL_ID),
        USER_POOL_ID: secret("USER_POOL_ID"),
        RDS_ARN: secret("RDS_ARN"),
        RDS_DATABASE: secret("RDS_DATABASE")
    }
});

