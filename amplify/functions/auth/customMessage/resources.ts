import { defineFunction } from "@aws-amplify/backend";

export const customMessageFnc = defineFunction({
    name: "customMessageFnc",
    timeoutSeconds: 30
});