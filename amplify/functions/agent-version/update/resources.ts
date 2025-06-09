import { defineFunction } from "@aws-amplify/backend";

export const updateAgentVersionFnc = defineFunction({
    name: "updateAgentVersionFnc",
    timeoutSeconds: 30,
})