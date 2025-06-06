import { defineFunction } from "@aws-amplify/backend";


export const updateAgentFnc = defineFunction({
    name: "updateAgentFnc",
    timeoutSeconds: 30,
})