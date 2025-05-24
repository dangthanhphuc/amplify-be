import { defineFunction } from "@aws-amplify/backend";


export const chatWithAgentFnc = defineFunction({
    name: 'chatWithAgentFnc',
    environment: {
        USER_POOL_CLIENT_ID: "4jn8ensor1j1017kkc2i029mss",
        USER_POOL_ID: "us-east-1_SLLh6TvGi",
        RDS_ARN: "arn:aws:rds:us-east-1:123456789012:db:mysql-db",
        RDS_DATABASE: "mydatabase"
    }
})