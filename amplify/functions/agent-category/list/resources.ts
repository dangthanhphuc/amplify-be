import { defineFunction } from '@aws-amplify/backend';

export const listAgentCategoriesFnc = defineFunction({
  name: 'listAgentCategoriesFnc',
  timeoutSeconds: 30,
});
