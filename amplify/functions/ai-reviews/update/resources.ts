import { defineFunction } from "@aws-amplify/backend";

export const updateAiReviewFnc = defineFunction({
    name: "updateAiReviewFnc",
    timeoutSeconds: 30
})