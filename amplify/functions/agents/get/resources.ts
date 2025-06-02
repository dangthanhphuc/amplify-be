import { defineFunction, secret } from "@aws-amplify/backend";

export const getAgentsFnc = defineFunction({
    name: "getAgentsFnc",
    timeoutSeconds: 30,
    environment: {
        RDS_ARN: secret("RDS_ARN"),
        RDS_DATABASE: secret("RDS_DATABASE")
    }
});