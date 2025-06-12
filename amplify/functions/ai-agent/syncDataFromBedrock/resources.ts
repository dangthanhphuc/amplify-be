import { defineFunction } from "@aws-amplify/backend";

export const syncDataFromBedrockFnc = defineFunction({
    name: "syncDataFromBedrockFnc",
    timeoutSeconds: 60
});