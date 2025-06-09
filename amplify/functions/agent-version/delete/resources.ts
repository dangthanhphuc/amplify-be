import { defineFunction } from "@aws-amplify/backend";

export const deleteAgentVersionFnc = defineFunction({
    name: "deleteAgentVersionFnc",
    timeoutSeconds: 30,
})