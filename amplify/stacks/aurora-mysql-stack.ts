// import { CfnOutput, Duration, RemovalPolicy, Stack } from 'aws-cdk-lib';
// import { Construct } from 'constructs';
// import { 
//   DatabaseCluster, 
//   DatabaseClusterEngine, 
//   AuroraCapacityUnit, 
//   AuroraMysqlEngineVersion, 
//   Credentials, 
//   ServerlessCluster 
// } from 'aws-cdk-lib/aws-rds';
// import { Secret } from 'aws-cdk-lib/aws-secretsmanager';
// import { SubnetType, Vpc } from 'aws-cdk-lib/aws-ec2';
// import { defineBackend } from '@aws-amplify/backend';

// export function createAuroraMySQLStack(backend: ReturnType<typeof defineBackend>) {
//   const stack = new Stack(backend, 'AuroraMySQLStack');
  
//   // Create a VPC for the database
//   const vpc = new Vpc(stack, 'AuroraVPC', {
//     maxAzs: 2, // Use 2 Availability Zones for high availability
//     natGateways: 0, // No NAT gateways to save costs
//   });
  
//   // Create a secret for database credentials
//   const databaseCredentials = new Secret(stack, 'AuroraCredentials', {
//     secretName: 'amplify/aurora-mysql-credentials',
//     generateSecretString: {
//       secretStringTemplate: JSON.stringify({ username: 'admin' }),
//       generateStringKey: 'password',
//       excludePunctuation: true,
//       includeSpace: false,
//       passwordLength: 16,
//     },
//   });
  
//   // Create a serverless Aurora MySQL cluster
//   const cluster = new ServerlessCluster(stack, 'AuroraCluster', {
//     engine: DatabaseClusterEngine.auroraMysql({
//       version: AuroraMysqlEngineVersion.VER_3_03_0,
//     }),
//     vpc,
//     credentials: Credentials.fromSecret(databaseCredentials),
//     defaultDatabaseName: 'amplifydb',
//     scaling: {
//       autoPause: Duration.minutes(10), // Auto pause after 10 minutes of inactivity
//       minCapacity: AuroraCapacityUnit.ACU_1, // Minimum capacity
//       maxCapacity: AuroraCapacityUnit.ACU_4, // Maximum capacity
//     },
//     vpcSubnets: {
//       subnetType: SubnetType.PRIVATE_ISOLATED,
//     },
//     removalPolicy: RemovalPolicy.SNAPSHOT, // Create a snapshot when the cluster is deleted
//   });
  
//   // Output the database connection information
//   const outputs = {
//     clusterEndpoint: new CfnOutput(stack, 'ClusterEndpoint', {
//       value: cluster.clusterEndpoint.hostname,
//     }),
//     clusterReadEndpoint: new CfnOutput(stack, 'ClusterReadEndpoint', {
//       value: cluster.clusterReadEndpoint.hostname,
//     }),
//     secretArn: new CfnOutput(stack, 'SecretArn', {
//       value: databaseCredentials.secretArn,
//     }),
//     databaseName: new CfnOutput(stack, 'DatabaseName', {
//       value: 'amplifydb',
//     }),
//   };
  
//   return { stack, outputs };
// }