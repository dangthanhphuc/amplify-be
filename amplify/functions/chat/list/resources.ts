import { defineFunction } from "@aws-amplify/backend";

export const listChatFnc = defineFunction({
    name: "listChatFnc",
    timeoutSeconds: 60
})