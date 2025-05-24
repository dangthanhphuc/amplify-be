import { defineFunction, secret } from "@aws-amplify/backend";

export const getUserInfoFnc = defineFunction({
    name: 'getUserInfoFnc',
    environment: {
        RDS_ARN: secret("RDS_ARN"),
    }
})