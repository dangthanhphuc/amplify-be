import { defineFunction } from '@aws-amplify/backend';

export const deleteAgentCategoryFnc = defineFunction({
  name: 'deleteAgentCategoryFnc',
  timeoutSeconds: 30,
});
