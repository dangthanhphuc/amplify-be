import { defineFunction } from "@aws-amplify/backend";

export const deleteAiReviewFnc = defineFunction({
    name: "deleteAiReviewFnc",
    timeoutSeconds: 30
})