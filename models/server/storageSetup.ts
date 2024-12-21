import { postAttachementBucket } from "../name";
import { storage } from "./config";

export default async function setupStorage() {
  try {
    // Get the bucket
    await storage.getBucket(postAttachementBucket);
    console.log("Bucket already exists");
  } catch (error) {
    try {
      await storage.createBucket(
        postAttachementBucket,
        postAttachementBucket,
        [],
        false,
        true,
        50000000,
        [
          "jpg",
          "png",
          "gif",
          "jpeg",
          "webp",
          "heic",
          "heif",
          "svg",
          "pdf",
          "doc",
          "docx",
          "xls",
          "mp4",
          "webm",
          "mp3",
          "wav",
        ],
      );
      console.log("Storage setup complete");
    } catch (error) {
      console.log("Error creating bucket", error);
    }
  }
  return storage;
}
