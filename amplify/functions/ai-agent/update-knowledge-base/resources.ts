import { defineFunction } from "@aws-amplify/backend";

export const updateKnowledgeBaseFnc = defineFunction({
    name: "updateKnowledgeBaseFnc",
    timeoutSeconds: 30
})