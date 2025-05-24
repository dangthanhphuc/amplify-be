import { defineFunction, secret } from "@aws-amplify/backend";


export const chatWithAgentFnc = defineFunction({
    name: 'chatWithAgentFnc',
    environment: {
        USER_POOL_CLIENT_ID: secret("USER_POOL_CLIENT_ID"),
        USER_POOL_ID: secret("USER_POOL_ID"),
        RDS_ARN: secret("RDS_ARN"),
        RDS_DATABASE: "mydatabase"
    }
})