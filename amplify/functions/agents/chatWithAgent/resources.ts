import { defineFunction, secret } from "@aws-amplify/backend";


export const chatWithAgentFnc = defineFunction({
    name: 'chatWithAgentFnc',
    environment: {
        USER_POOL_CLIENT_ID: String(process.env.USER_POOL_CLIENT_ID),
        USER_POOL_ID: String(process.env.USER_POOL_ID),
        RDS_ARN: secret("RDS_ARN"),
        RDS_DATABASE: "mydatabase"
    },
    timeoutSeconds: 60,
    layers: {
        "aws-sdk-nodejs20": "arn:aws:lambda:us-east-1:842676020404:layer:aws-sdk-nodejs20:1",
        "aws-sdk-clients-js-nodejs20": "arn:aws:lambda:us-east-1:842676020404:layer:aws-sdk-clients-js-nodejs20:2"
    },
    architecture: "arm64"
})