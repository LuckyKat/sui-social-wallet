import {
    generateMnemonicAndKeyPair,
    mnemonicToSeedHex,
} from '../src/utils/crypto';

describe('Crypto utils', () => {

    it('can generate a mnemonic and keypair', async () => {

        const { mnemonic, keyPair } = generateMnemonicAndKeyPair();
        expect(mnemonic).toBeTruthy();
        expect(mnemonic.split(' ')).toHaveLength(12);

        expect(keyPair).toBeTruthy();
        expect(keyPair.publicKey).toBeTruthy();
        expect(keyPair.publicKey).toHaveLength(32);
        expect(keyPair.secretKey).toBeTruthy();
        expect(keyPair.secretKey).toHaveLength(64);
    });

    it('can generate a seed from a valid mnemonic', async () => {

        const seed = mnemonicToSeedHex('hedgehog rack elder head roast industry together bird intact donor wise speak');
        expect(seed).toBeTruthy();
        expect(seed).toEqual('839acedb3fd0f4c7605987a5e49a7978f1f29eb5af2b62d2d7f8c2b965955263202f454aae365c6d916801b2f46fb7250cc9268388c4a6c7ce5ddefb6b71e4da');
    });

    it('throws an error given an invalid mnemonic', async () => {

        expect(() => {
            mnemonicToSeedHex('some fake banana mnemonic');
        }).toThrow('Invalid mnemonic');
    });

});






