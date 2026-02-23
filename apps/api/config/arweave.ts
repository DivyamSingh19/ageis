import { Configuration,StorageApi,Token,Network } from "arweave-storage-sdk";

const config = new Configuration({
    appName: '<Name of your App>',
	privateKey: '<ENV to private key or use_web_wallet>',
	network: Network.BASE_TESTNET,
	token: Token.USDC
})

const storageClient = new StorageApi(config);
 