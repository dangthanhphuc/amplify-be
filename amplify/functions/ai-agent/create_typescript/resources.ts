import { defineFunction } from "@aws-amplify/backend";

export const createAgentFunction = defineFunction({
  name: "create-bedrock-agent",
  timeoutSeconds: 900, // 15 minutes - tạo agent có thể mất thời gian
});