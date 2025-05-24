import { defineFunction, secret } from "@aws-amplify/backend";

export const postConfirmationFnc = defineFunction({
    name: "postConfirmationFnc",
    environment: {
        RDS_ARN: secret("RDS_ARN")
    }
});