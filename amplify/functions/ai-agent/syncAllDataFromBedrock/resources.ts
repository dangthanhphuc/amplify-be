import { defineFunction } from "@aws-amplify/backend";

export const syncAllDataFromBedrockFnc = defineFunction({
    name: "syncAllDataFromBedrockFnc",
    timeoutSeconds: 60
});