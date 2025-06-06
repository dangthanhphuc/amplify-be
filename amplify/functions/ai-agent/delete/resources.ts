import { defineFunction } from "@aws-amplify/backend";

export const deleteAgentFnc = defineFunction({
    name: "deleteAgentFnc",
    timeoutSeconds: 30
})