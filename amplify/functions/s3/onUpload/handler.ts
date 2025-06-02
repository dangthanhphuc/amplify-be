import type { S3Handler } from "aws-lambda";
import { env } from "$amplify/env/onUploadS3Fnc";
import { getAmplifyClient } from "../../../utils/clientUtil";
import { getS3Client } from "../../../utils/clients";
import { S3Service } from "../../../services/s3Service";

export const handler: S3Handler = async (event) => {
  console.log("Upload handler invoked for objecssts", JSON.stringify(event));
  // Only upload 1 object at a time
  const s3Records = event.Records[0].s3;

  // Data
  const bucketName = s3Records.bucket.name;
  const key = decodeURIComponent(s3Records.object.key.replace(/\+/g, ' '));;

  // Clients
  const amplifyClient = await getAmplifyClient(env);
  const s3Client = getS3Client();

  // Service
  const s3Service = new S3Service({ s3Client });

  try {
    // 1. Get the metadata of the uploaded object
    console.log("Getting metadata for object:", key, bucketName);
    const metadata: Record<string, string> = await s3Service.getMetadata({
      bucketName,
      key,
    });
    console.log("Object metadata:", metadata);

    if (metadata && metadata.id && metadata.for) {
      if (metadata.for == "users") {
        // 2. Get user's profile image from the database
        const result = await amplifyClient.models.Users.get(
          {
            id: metadata.id,
          },
          {
            selectionSet: ["profile_image"],
          }
        );
        const userImage = result.data?.profile_image as string;

        // Check if the image is not a public image
        if (!userImage.startsWith("public-images")) {
          // 3. Delete the old object from S3
          s3Service.deleteObject({
            bucketName,
            key: userImage,
          });
          console.info("Old profile image deleted from S3");
        }

        // 4. Update the user's profile image in the database
        await amplifyClient.models.Users.update({
          id: metadata.id,
          profile_image: key,
        });
        console.info("User profile image updated in the database");
      } else if (metadata.for == "ai_agents") {
        // 2. Get ai agent's profile image from the database
        const result = await amplifyClient.models.AiAgents.get(
          {
            id: metadata.id,
          },
          {
            selectionSet: ["icon"],
          }
        );
        const aiAgentIcon = result.data?.icon as string;

        // Check if the icon is not a public image
        if (!aiAgentIcon.startsWith("public-images")) {
          // 3. Delete the old object from S3
          s3Service.deleteObject({
            bucketName,
            key: aiAgentIcon,
          });
          console.info("Old profile image deleted from S3");
        }

        // 4. Update the ai agent's icon in the database
        await amplifyClient.models.AiAgents.update({
          id: metadata.id,
          icon: key,
        });
        console.info("Ai agent profile image updated in the database");
      }
    } else {
      console.error("Metadata does not contain userid or for");
    }
  } catch (error) {
    console.error("Error processing upload event:", error);
  }
};
