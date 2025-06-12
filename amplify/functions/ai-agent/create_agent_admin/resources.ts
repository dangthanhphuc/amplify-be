import { defineFunction, secret } from "@aws-amplify/backend";

export const createAgentExpertFnc = defineFunction({
    name:"createAgentExpertFnc",
    timeoutSeconds: 600,
})