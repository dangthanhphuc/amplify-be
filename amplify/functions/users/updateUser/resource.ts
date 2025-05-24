import { defineFunction, secret } from "@aws-amplify/backend";

export const updateUserFnc = defineFunction({
    name: 'updateUserFnc',
    environment: {
        RDS_ARN: secret("RDS_ARN")
    }
});