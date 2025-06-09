import { defineFunction } from "@aws-amplify/backend";

export const createAgentVersionFnc = defineFunction({
    name: "createAgentVersionFnc",
    timeoutSeconds: 30,
})