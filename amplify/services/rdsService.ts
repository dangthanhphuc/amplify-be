import { BatchExecuteStatementCommand, RDSDataClient } from "@aws-sdk/client-rds-data";

export class RDSService {
    private client : RDSDataClient;

    constructor(client: RDSDataClient) {
        this.client = client;
    }

    async batchExecuteStatementCommand(batchExecuteStatement : BatchExecuteStatementCommand) {
        return this.client.send(batchExecuteStatement);
    }
}