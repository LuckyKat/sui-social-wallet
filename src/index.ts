// import { SuiWallet } from './wallets/sui';


// const wallet = new SuiWallet();
// wallet.features['standard:connect'].connect();

import { SuiWallet } from './wallet/sui';

if (typeof window !== 'undefined') {
    // export all methods to a global name
    //@ts-ignore
	Object.defineProperty(window, 'SuiSocialWallet', {
		value: {
			SuiWallet: SuiWallet
		}
	});
}
