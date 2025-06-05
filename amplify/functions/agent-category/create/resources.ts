import { defineFunction } from '@aws-amplify/backend';

export const createAgentCategoryFnc = defineFunction({
  name: 'createAgentCategoryFnc',
  timeoutSeconds: 30,
});
