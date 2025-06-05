import { defineFunction } from "@aws-amplify/backend";

export const createUserLikeFnc = defineFunction({
  name: "createUserLikeFnc",
  timeoutSeconds: 60,
});