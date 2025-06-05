import { defineFunction } from "@aws-amplify/backend";

export const deleteUserLikeFnc = defineFunction({
    name: "deleteUserLikeFnc",
    timeoutSeconds: 30
})