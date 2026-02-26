import { pinata, PINATA_GATEWAY } from "../../config/pinata";

export const uploadFilesToPinata = async (
  files: Express.Multer.File[]
): Promise<string[]> => {
  const uploadPromises = files.map(async (file) => {
    // Cast to ArrayBuffer to satisfy TypeScript's strict BlobPart typing
    const arrayBuffer = file.buffer.buffer.slice(
      file.buffer.byteOffset,
      file.buffer.byteOffset + file.buffer.byteLength
    ) as ArrayBuffer;

    const blob = new Blob([arrayBuffer], { type: file.mimetype });
    const fileObj = new File([blob], file.originalname, { type: file.mimetype });

    const response = await pinata.upload.public.file(fileObj);

    return `https://${PINATA_GATEWAY}/ipfs/${response.cid}`;
  });

  return Promise.all(uploadPromises);
};