import {
    Base64DataBuffer,
    Ed25519Keypair
} from "@mysten/sui.js";
import { SuiWallet } from '../src/wallet/sui';

describe('Sui wallet', () => {

    let keypair: Ed25519Keypair;
    let address: string;
    let wallet: SuiWallet;
    
    beforeAll(async () => {
        keypair = Ed25519Keypair.generate();
        address = keypair.getPublicKey().toSuiAddress();
        wallet = new SuiWallet(keypair);
        console.log('Generated address:', address);

        const response = await wallet.requestFromFaucet();
        expect(response.transferred_gas_objects.amount > 0);
    });

    it('can connect and list accounts', async () => {

        const response = await wallet.connect();

        let accounts = response.accounts;
        expect(accounts).toHaveLength(1);

        const address = accounts[0].address;
        expect(address).toBeDefined();
        expect(address).not.toBe('');

        // Test that the accounts getter works correctly
        accounts = wallet.accounts;
        expect(accounts).toHaveLength(1);

        expect(address).toBe(accounts[0].address);
    });

    it('can mint and retrieve an NFT', async () => {

        const functionArguments = [
            'Example NFT',
            'An example NFT',
            'ipfs://bafkreibngqhl3gaa7daob4i2vccziay2jjlp435cf66vhono7nrvww53ty',
        ];

        // Test the executeMoveCall method
        const transaction1 = await wallet.executeMoveCall('0x2', 'devnet_nft', 'mint', functionArguments, 10000);
        expect(transaction1).toBeDefined();

        // Test the signAndExecuteTransaction method
        const transaction2 = await wallet.signAndExecuteTransaction({
            transaction: {
                kind: 'moveCall',
                data: {
                    packageObjectId: '0x2',
                    module: 'devnet_nft',
                    function: 'mint',
                    typeArguments: [],
                    arguments: functionArguments,
                    gasBudget: 10000,
                }
            }
        });
        expect(transaction2).toBeDefined();

        const nfts = await wallet.getNfts();
        expect(nfts).toHaveLength(2);
    });

    it('can sign a message', async () => {

        // Test passing a string
        const stringMessage = "A test message";
        let response = await wallet.signMessage(stringMessage);
        expect(response).toBeDefined();

        // Test passing a Uint8Array
        const uintArrayMessage = new Uint8Array(Buffer.from(stringMessage));
        response = await wallet.signMessage(uintArrayMessage);
        expect(response).toBeDefined();

        // Test passing a Base64DataBuffer
        const dataBufferMessage = new Base64DataBuffer(stringMessage);
        response = await wallet.signMessage(dataBufferMessage);
        expect(response).toBeDefined();
    });

    it('throws an error if a move function does not exist', async () => {
        try {
            await wallet.executeMoveCall('0x2', 'devnet_nft', 'mintdfdf', [], 10000);
        }
        catch (error) {
            if (error instanceof Error) {
                expect(error.message).toContain('Error executing a move call: Error: RPC Error: Could not resolve function');
            }
            else {
                console.error(error);
            }
        }
    });

});






