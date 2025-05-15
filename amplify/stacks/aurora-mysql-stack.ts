
// import { defineBackend } from '@aws-amplify/backend';
// import { aws_rds as rds } from 'aws-cdk-lib';

// export function createAuroraMySQLStack(backend: ReturnType<typeof defineBackend>) {
//   const stack = backend.createStack('aurora-mysql-stack');
  
//   const dbCluster = new rds.CfnDBCluster(stack, "DBCluster", {
//     databaseName: "ai_agent_system_db",
//     engine: "aurora-mysql",
//   });
// }