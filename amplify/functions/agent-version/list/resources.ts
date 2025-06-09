import { defineFunction } from "@aws-amplify/backend";

export const listAgentVersionFnc = defineFunction({
    name: "listAgentVersionFnc",
    timeoutSeconds: 30,
})