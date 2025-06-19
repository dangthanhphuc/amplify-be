import { defineFunction } from "@aws-amplify/backend";

export const listChatByUserIdFnc = defineFunction({
    name: "listChatByUserIdFnc",
    timeoutSeconds: 60
})