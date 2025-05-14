import { defineFunction } from "@aws-amplify/backend";

export const getAgentsFnc = defineFunction({
    name: "getAgentsFnc",
    environment: {
        RDS_ARN: String(process.env.RDS_ARN),
        RDS_DATABASE: String(process.env.RDS_DATABASE)
    }
});