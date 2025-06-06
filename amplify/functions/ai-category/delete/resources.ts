import { defineFunction } from "@aws-amplify/backend";


export const deleteAiCategoryFnc = defineFunction({
    name: 'deleteAiCategoryFnc',
    timeoutSeconds: 30,
})