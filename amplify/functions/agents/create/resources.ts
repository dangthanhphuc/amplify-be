import { defineFunction } from "@aws-amplify/backend";

export const createAgentFnc = defineFunction({
    name:"createAgentFnc",
    timeoutSeconds: 30
})