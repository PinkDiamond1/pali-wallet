import { IWalletController } from 'types/controllers';
import { browser } from 'webextension-polyfill-ts';

import WalletController from './WalletController';
import ControllerUtils, { IControllerUtils } from './ControllerUtils';
import ConnectionsController from './ConnectionsController';
import DAppController, { IDAppController } from './DAppController';

export interface IMasterController {
  appRoute: (newRoute?: string) => string;
  connections: Readonly<any>;
  createPopup: (
    windowId: any,
    network: string,
    route: string,
    data: object
  ) => any;
  dapp: Readonly<IDAppController>;
  stateUpdater: () => void;
  utils: Readonly<IControllerUtils>;
  wallet: Readonly<IWalletController>;
}

const MasterController = (): IMasterController => {
  const wallet = Object.freeze(WalletController());
  const utils = Object.freeze(ControllerUtils());
  const dapp = Object.freeze(DAppController());
  const connectionsPrototype = Object.create(ConnectionsController);

  const stateUpdater = () => {
    utils.updateFiat();
  };

  const createPopup = async (
    windowId,
    network = 'main',
    route = '',
    data = {}
  ) => {
    const _window = await browser.windows.getCurrent();

    if (!_window || !_window.width) return null;

    let url = '/app.html?';

    if (route) {
      url += `route=${route}&windowId=${windowId}&data=${JSON.stringify(
        data
      )}&network=${network}`;
    }

    console.log('creating popup', url);

    return browser.windows.create({
      url,
      width: 372,
      height: 600,
      type: 'popup',
      top: 0,
      left: _window.width - 372,
    });
  };

  return {
    wallet,
    dapp,
    connections: Object.freeze(connectionsPrototype),
    appRoute: utils.appRoute,
    utils,
    stateUpdater,
    createPopup,
  };
};

export default MasterController;
