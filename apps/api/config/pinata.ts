import { PinataSDK } from "pinata";

const pinataConfig = new PinataSDK({
  pinataJwt: process.env.PINATA_API_KEY as string,
  pinataGateway: process.env.PINATA_GATEWAY as string,
});
  
 