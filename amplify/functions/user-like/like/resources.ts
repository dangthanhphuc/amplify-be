import { defineFunction } from "@aws-amplify/backend";


export const likeFnc = defineFunction({
    name: "likeFnc",
    timeoutSeconds: 30
})