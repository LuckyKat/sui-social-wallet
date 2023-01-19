import * as bip39 from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english';
import { derivePath } from "ed25519-hd-key";
import nacl from "tweetnacl";

// SUI - 784
export const ED25519_DERIVATION_PATH = "m/44'/784'/0'/0'/0'";

export function generateMnemonic(): string {

	return bip39.generateMnemonic(wordlist);
}

export function mnemonicToSeedHex(mnemonic: string) {

	const seed = bip39.mnemonicToSeedSync(mnemonic);
	return Buffer.from(seed).toString('hex');
}

export function keyPairFromSeed(seed: string) {

	const { key } = derivePath(ED25519_DERIVATION_PATH, seed);

	if (!key) {
		throw new Error('Derived seed is invalid');
	}

	return nacl.sign.keyPair.fromSeed(key);
}

export function generateMnemonicAndKeyPair() {

	const mnemonic = generateMnemonic();
    const seed = mnemonicToSeedHex(mnemonic);
    const keyPair = keyPairFromSeed(seed);
	return { mnemonic, keyPair };
}


