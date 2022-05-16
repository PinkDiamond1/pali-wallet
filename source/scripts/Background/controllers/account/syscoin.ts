import store from 'state/store';
import {
  setActiveAccount,
  setActiveAccountProperty,
  setIsPendingBalances,
} from 'state/vault';
import { KeyringManager, Web3Accounts } from '@pollum-io/sysweb3-keyring';
import { setActiveNetwork } from '@pollum-io/sysweb3-network';
import { IKeyringAccountState, INetwork } from '@pollum-io/sysweb3-utils';
import { CoingeckoCoins } from 'types/controllers';

import SysTrezorController from '../trezor/syscoin';
import { SysTransactionController } from '../transaction';

const SysAccountController = () => {
  const keyringManager = KeyringManager();

  const getLatestUpdate = async (silent?: boolean) => {
    if (!silent) store.dispatch(setIsPendingBalances(true));

    const { activeAccount, networks, activeNetwork } = store.getState().vault;

    if (!activeAccount) return;

    const updatedAccountInfo = await keyringManager.getLatestUpdateForAccount();

    store.dispatch(setIsPendingBalances(false));

    const isSyscoinChain = Boolean(networks.syscoin[activeNetwork.chainId]);

    const { assets } = updatedAccountInfo;

    const storedAssets = activeAccount.assets.filter((asset: any) =>
      assets.filter(
        (activeAccountAsset: any) => activeAccountAsset.id !== asset.id
      )
    );

    store.dispatch(
      setActiveAccount({
        ...activeAccount,
        ...updatedAccountInfo,
        assets: isSyscoinChain ? assets : storedAssets,
      })
    );
  };

  /** check if there is no pending transaction in mempool
   *  and get the latest update for account
   */
  const watchMemPool = (currentAccount: IKeyringAccountState | undefined) => {
    // 30 seconds - 3000 milliseconds
    const interval = 30 * 1000;

    const intervalId = setInterval(() => {
      getLatestUpdate(true);

      if (!currentAccount || !currentAccount?.transactions) {
        clearInterval(intervalId);

        return false;
      }
    }, interval);

    return true;
  };

  const setAddress = async (): Promise<string> => {
    // @ts-ignore
    const { receivingAddress } =
      await keyringManager.getLatestUpdateForAccount();

    store.dispatch(
      setActiveAccountProperty({
        property: 'address',
        value: String(receivingAddress),
      })
    );

    return receivingAddress;
  };

  const getErc20TokenBalance = async (
    tokenAddress: string,
    walletAddress: string
  ) => {
    try {
      const balance = await Web3Accounts().getBalanceOfAnyToken(
        tokenAddress,
        walletAddress
      );

      return balance;
    } catch (error) {
      return 0;
    }
  };

  const saveTokenInfo = async (token: CoingeckoCoins) => {
    const { activeAccount } = store.getState().vault;

    const tokenExists = activeAccount.assets.find(
      (asset: any) => asset.id === token.id
    );

    if (tokenExists) throw new Error('Token already exists');

    const balance = await getErc20TokenBalance(
      String(token.contract_address),
      activeAccount.address
    );

    const web3Token = {
      ...token,
      balance,
    };

    store.dispatch(
      setActiveAccountProperty({
        property: 'assets',
        value: [...activeAccount.assets, web3Token],
      })
    );
  };

  const getUserNfts = async (walletAddress: string, network: INetwork) => {
    try {
      if (network.currency === 'eth') {
        setActiveNetwork(network);

        return await Web3Accounts()
          .getNftsByAddress(walletAddress, network)
          .then((nfts: any) => {
            if (nfts) {
              store.dispatch(
                setActiveAccountProperty({
                  property: 'nfts',
                  value: nfts as [],
                })
              );

              // nfts.map(async (nft: any) => {
              //   const nftImage = await getNftImage(String(nft.contractAddress), Number(nft.tokenID))

              //   if(nftImage) {
              //     console.log('nftImage', nftImage)

              //   }

              //   return;

              //   const nftObject = {
              //     ...nft,
              //     nft_image: nftImage
              //   }

              //   store.dispatch(
              //     setActiveAccountProperty({
              //       property: 'nfts',
              //       value: [nftObject],
              //     })
              //   );
              // })
            }
          });
      }
      return;
    } catch (error) {
      throw new Error('NFTs not found, please change the current network!');
    }
  };

  const trezor = SysTrezorController();
  const tx = SysTransactionController();

  return {
    watchMemPool,
    trezor,
    tx,
    setAddress,
    getLatestUpdate,
    saveTokenInfo,
    getUserNfts,
  };
};

export default SysAccountController;
