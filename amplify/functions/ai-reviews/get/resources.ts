import { defineFunction } from "@aws-amplify/backend";

export const getAiReviewFnc = defineFunction({
    name: "getAiReviewFnc",
    timeoutSeconds: 30
})