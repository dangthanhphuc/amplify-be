import { defineFunction } from "@aws-amplify/backend";

export const testFnc = defineFunction({
    name: 'testFnc',
    timeoutSeconds: 30,
})