import { defineFunction } from "@aws-amplify/backend";

export const createAiReviewFnc = defineFunction({
    name: "createAiReviewFnc",
    timeoutSeconds: 30,
})