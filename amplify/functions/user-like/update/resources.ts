import { defineFunction } from "@aws-amplify/backend";

export const updateUserLikeFnc = defineFunction({
    name: "updateUserLikeFnc",
    timeoutSeconds: 30
})