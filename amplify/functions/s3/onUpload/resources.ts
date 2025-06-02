import { defineFunction } from "@aws-amplify/backend";

export const onUploadS3Fnc = defineFunction({
    name: "onUploadS3Fnc",
    timeoutSeconds: 30
})