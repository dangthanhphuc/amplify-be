import { DeleteObjectCommand, HeadObjectCommand, S3Client } from "@aws-sdk/client-s3";


export class S3Service {
    private s3Client: S3Client;

    constructor({s3Client}: { s3Client: S3Client }) {
        this.s3Client = s3Client;
    }

    async getMetadata({ bucketName, key }: { bucketName: string; key: string }) {
        const headObjectResponse = await this.s3Client.send(new HeadObjectCommand({
            Bucket: bucketName,
            Key: key
        }));

        if(headObjectResponse.Metadata) {
            return headObjectResponse.Metadata;
        } 

        return {};
    }

    async deleteObject({ bucketName, key }: { bucketName: string; key: string }) {
        const command = new DeleteObjectCommand({
            Bucket: bucketName,
            Key: key,
        });

        const result = await this.s3Client.send(command);

        return result.$metadata.httpStatusCode;
    }
}