import { defineFunction } from "@aws-amplify/backend";

export const listUserLikesFnc = defineFunction({
    name: "listUserLikesFnc",
    timeoutSeconds: 30
})