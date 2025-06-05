import { defineFunction } from "@aws-amplify/backend";

export const listAiReviewsFnc = defineFunction({
    name: "listAiReviewsFnc",
    timeoutSeconds: 30
})