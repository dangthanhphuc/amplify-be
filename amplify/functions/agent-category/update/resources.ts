import { defineFunction } from '@aws-amplify/backend';

export const updateAgentCategoryFnc = defineFunction({
  name: 'updateAgentCategoryFnc',
  timeoutSeconds: 30,
});
