import { defineFunction } from '@aws-amplify/backend';

export const preTokenGeneration = defineFunction({
  name: 'pre-token-generation',
  timeoutSeconds: 10,
  resourceGroupName: 'auth'
});