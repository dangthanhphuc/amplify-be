import { defineFunction, secret } from "@aws-amplify/backend";

export const initialDataForAiAgentFnc = defineFunction({
    name: "initialDataForAiAgentFnc",
    environment: {
        RDS_ARN: secret("RDS_ARN"),
        RDS_DATABASE: secret("RDS_DATABASE")
    }
});