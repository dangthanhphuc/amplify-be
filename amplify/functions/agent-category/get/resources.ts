import { defineFunction } from '@aws-amplify/backend';

export const getAgentCategoryFnc = defineFunction({
  name: 'getAgentCategoryFnc',
  timeoutSeconds: 30,
});
