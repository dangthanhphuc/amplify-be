import { RDSDataClient } from "@aws-sdk/client-rds-data";

const region = "us-east-1"; 

export const rdsClient = new RDSDataClient({ region });
