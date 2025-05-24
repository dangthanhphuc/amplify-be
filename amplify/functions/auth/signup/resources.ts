import { defineFunction, secret } from "@aws-amplify/backend";

export const signUpPostMethodFnc = defineFunction({
    name: 'signUpPostMethodFnc',
    environment: {
        USER_POOL_CLIENT_ID: "4jn8ensor1j1017kkc2i029mss",
        // USER_POOL_ID: String(process.env.USER_POOL_ID),
        USER_POOL_ID: "us-east-1_SLLh6TvGi",
        RDS_ARN: secret("RDS_ARN"),
        RDS_DATABASE: secret("RDS_DATABASE")
    }
});

