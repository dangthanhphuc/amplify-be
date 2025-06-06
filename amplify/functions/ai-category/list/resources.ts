import { defineFunction } from "@aws-amplify/backend";

export const listAiCategoriesFnc = defineFunction({
    name: 'listAiCategoriesFnc',
    timeoutSeconds: 30,
})