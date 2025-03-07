import { ASSET_PRICE_API } from 'constants/index';

import store from 'state/store';
import { setPrices, setCoins } from 'state/price';
import { logError } from 'utils/index';
import {
  getSearch as getCoingeckoSearch,
  isValidEthereumAddress,
  isValidSYSAddress,
  getTokenJson,
  getWeb3TokenData,
  getAsset,
  txUtils,
} from '@pollum-io/sysweb3-utils';
import CoinGecko from 'coingecko-api';
import { IControllerUtils } from 'types/controllers';

export const CoinGeckoClient = new CoinGecko();

const ControllerUtils = (): IControllerUtils => {
  let route = '/';

  const appRoute = (newRoute?: string) => {
    if (newRoute) {
      route = newRoute;
    }

    return route;
  };

  const setFiatCurrencyForWallet = async ({ base, currency }) => {
    const data = await CoinGeckoClient.simple.price({
      ids: [base],
      vs_currencies: [currency],
    });

    return data;
  };

  const setFiat = async (currency?: string) => {
    if (!currency) {
      const storeCurrency = store.getState().price.fiat.asset;
      currency = storeCurrency || 'usd';
    }

    try {
      const { activeNetwork, networks } = store.getState().vault;

      const chain = networks.syscoin[activeNetwork.chainId]
        ? 'syscoin'
        : 'ethereum';

      const { success, data } = await setFiatCurrencyForWallet({
        base: chain,
        currency,
      });

      const currencies = await (
        await fetch(`${ASSET_PRICE_API}/currency`)
      ).json();

      if (currencies && currencies.rates) {
        store.dispatch(setCoins(currencies.rates));
      }

      if (success && data) {
        store.dispatch(
          setPrices({
            asset: currency,
            price: data[chain][currency],
          })
        );
      }
    } catch (error) {
      logError('Failed to retrieve asset price', '', error);
    }
  };

  const importToken = async (contractAddress: string) =>
    await getWeb3TokenData(contractAddress);

  const getSearch = async (query: string): Promise<any> =>
    getCoingeckoSearch(query);

  const getDataForToken = async (tokenId: string) => {
    const response = await CoinGeckoClient.coins.fetch(tokenId);

    return response;
  };

  const getTokenDataByContractAddress = async (
    address: string,
    platform: string
  ) => {
    const { data, success } = await CoinGeckoClient.coins.fetchCoinContractInfo(
      address,
      platform
    );

    if (!success || data.error) return new Error(data.error);

    return {
      data,
      success,
    };
  };

  const txs = txUtils();

  return {
    appRoute,
    setFiat,
    setFiatCurrencyForWallet,
    importToken,
    getSearch,
    getAsset,
    isValidEthereumAddress,
    isValidSYSAddress,
    getTokenJson,
    getDataForToken,
    getTokenDataByContractAddress,
    ...txs,
  };
};

export default ControllerUtils;
