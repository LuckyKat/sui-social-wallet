import {
    Base64DataBuffer,
    Ed25519Keypair,
    getCertifiedTransaction,
    getTransactionEffects,
    JsonRpcProvider,
    Network,
    RawSigner,
} from "@mysten/sui.js";

import {
    SUI_CHAINS,
    ConnectFeature,
    DisconnectFeature,
    EventsFeature,
    EventsOnMethod,
    ReadonlyWalletAccount,
    SuiSignAndExecuteTransactionFeature,
    SuiSignAndExecuteTransactionInput,
    SuiSignAndExecuteTransactionOutput,
    Wallet,
    EventsListeners,
} from "@mysten/wallet-standard";

import mitt, { type Emitter } from 'mitt';

type WalletEventsMap = {
    [E in keyof EventsListeners]: Parameters<EventsListeners[E]>[0];
};

export class SuiWallet implements Wallet {

    readonly #events: Emitter<WalletEventsMap>;
    #account: ReadonlyWalletAccount | null;
    #provider: JsonRpcProvider;
    #keypair: Ed25519Keypair;
    #signer: RawSigner;

    get version() {
        // Version of the Wallet Standard this implements
        return "1.0.0" as const;
    }
    get name() {
        return "Sui Social Wallet";
    }
    get icon() {
        return "";
    }

    get accounts() {
        return this.#account ? [this.#account] : [];
    }
    get chains() {
        // Return the Sui chains that this wallet supports.
        return SUI_CHAINS;
    }

    get features(): ConnectFeature & DisconnectFeature & EventsFeature & SuiSignAndExecuteTransactionFeature {
        return {
            "standard:connect": {
                version: "1.0.0",
                connect: this.connect,
            },
            "standard:disconnect": {
                version: "1.0.0",
                disconnect: this.disconnect,
            },
            "standard:events": {
                version: "1.0.0",
                on: this.#on,
            },
            "sui:signAndExecuteTransaction": {
                version: "1.0.0",
                signAndExecuteTransaction: this.signAndExecuteTransaction,
            },
            // 'experimental:signTransaction': {
            //     signTransaction(account: WalletAccount, chain: string, transaction: Uint8Array) {},
            // },
            // 'experimental:signMessage': {
            //     signMessage(account: WalletAccount, message: Uint8Array) {},
            // },
        };
    }

    constructor(keypair: Ed25519Keypair, network: string | Network = Network.LOCAL) {
        this.#events = mitt();
        this.#keypair = keypair;
        this.#account = null;

        this.#provider = new JsonRpcProvider(network);
        this.#signer = new RawSigner(
            this.#keypair,
            this.#provider,
        );
    }

    async connect() {

        this.#account = new ReadonlyWalletAccount({
          address: this.#keypair.getPublicKey().toSuiAddress(),
          publicKey: this.#keypair.getPublicKey().toBytes(),
          chains: this.chains,
          // The features that this account supports. This can be a subset of the wallet's supported features.
          // These features must exist on the wallet as well.
          features: ["sui:signAndExecuteTransaction"],
        });

        return { accounts: this.accounts };
    }

    async disconnect() {
        return;
    }

    async getNfts() {

        const objects = await this.#provider.getObjectsOwnedByAddress(
            this.#keypair.getPublicKey().toSuiAddress()
        );

        return objects;
    }

    #on: EventsOnMethod = (event, listener) => {
        this.#events.on(event, listener);
        return () => this.#events.off(event, listener);
    };

    async signAndExecuteTransaction(input: SuiSignAndExecuteTransactionInput): Promise<SuiSignAndExecuteTransactionOutput> {

        if (!this.#account) {
            throw new Error("Not connected");
        }

        const response = await this.#signer.signAndExecuteTransaction(input.transaction);

        // return SuiTransactionResponse object
        return {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            certificate: getCertifiedTransaction(response)!,
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            effects: getTransactionEffects(response)!,
            timestamp_ms: null,
            parsed_data: null,
        };
    }

    async signMessage(message: string | Uint8Array | Base64DataBuffer) {

        if (!this.#account) {
            throw new Error("Not connected");
        }

        let data: Base64DataBuffer;

        if (message instanceof Base64DataBuffer) {
            data = message;
        }
        else {
            data = new Base64DataBuffer(message);
        }

        const response = await this.#signer.signData(data);
        return response;
    }

    async transferObject(objectId: string, recipientAddress: string, gasBudget: number) {

        const transaction = await this.#signer.transferObject({
            objectId: objectId,
            gasBudget: gasBudget,
            recipient: recipientAddress,
        });
        return transaction;
    }

    async executeMoveCall(packageId: string, moduleName: string, functionName: string, functionArguments: Array<string>, gasBudget: number) {

        const transaction = await this.#signer.executeMoveCall({
            packageObjectId: packageId,
            module: moduleName,
            function: functionName,
            typeArguments: [],
            arguments: functionArguments,
            gasBudget: gasBudget,
        });
        return transaction;
    }

    async requestFromFaucet() {
        return this.#provider.requestSuiFromFaucet(this.#keypair.getPublicKey().toSuiAddress());
    }

}
