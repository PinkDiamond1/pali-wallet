/* eslint-disable prettier/prettier */
import 'emoji-log';
import { STORE_PORT } from 'constants/index';

import { browser } from 'webextension-polyfill-ts';
import { wrapStore } from 'webext-redux';
import store from 'state/store';
import {
  setSenderURL,
  updateCanConnect,
  updateCurrentURL,
  updateConnectionsArray,
  removeConnection,
  updateCanConfirmTransaction,
} from 'state/wallet';

import MasterController, { IMasterController } from './controllers';
import { IAccountState } from 'state/wallet/types';

declare global {
  interface Window {
    controller: Readonly<IMasterController>;
    senderURL: string | undefined;
  }
}

if (!window.controller) {
  window.controller = Object.freeze(MasterController());
  setInterval(window.controller.stateUpdater, 3 * 60 * 1000);
}

browser.runtime.onInstalled.addListener((): void => {
  console.emoji('🤩', 'Syscoin extension installed');

  window.controller.stateUpdater();

  browser.runtime.onMessage.addListener(async (request, sender) => {
    const {
      type,
      target
    } = request;

    const tabs = await browser.tabs.query({
      active: true,
      windowType: 'normal'
    });

    const tabId = Number(tabs[0].id);

    const createPopup = async (url: string) => {
      return await browser.windows.create({
        url,
        type: 'popup',
        width: 372,
        height: 600,
        left: 900,
        top: 90
      });
    }

    if (typeof request == 'object') {
      if (type == 'CONNECT_WALLET' && target == 'background') {
        const URL = browser.runtime.getURL('app.html');
        
        store.dispatch(setSenderURL(sender.url));
        store.dispatch(updateCanConnect(true));

        await createPopup(URL);

        window.senderURL = sender.url;

        return;
      }

      if (type == 'WALLET_UPDATED' && target == 'background') {
        browser.tabs.sendMessage(tabId, {
          type: 'WALLET_UPDATED',
          target: 'contentScript',
          connected: false
        });

        return;
      }

      if (type == 'RESET_CONNECTION_INFO' && target == 'background') {
        store.dispatch(setSenderURL(''));
        store.dispatch(updateCanConnect(false));

        store.dispatch(removeConnection({
          accountId: request.id,
          url: request.url 
        }));

        browser.tabs.sendMessage(tabId, {
          type: 'WALLET_UPDATED',
          target: 'contentScript',
          connected: false
        });

        return;
      }

      if (type == 'SELECT_ACCOUNT' && target == 'background') {
        store.dispatch(updateConnectionsArray({
          accountId: request.id,
          url: window.senderURL 
        }));
       
        return;
      }

      if (type == 'CHANGE_CONNECTED_ACCOUNT' && target == 'background') {
        store.dispatch(updateConnectionsArray({
          accountId: request.id,
          url: window.senderURL 
        }));

        browser.tabs.sendMessage(tabId, {
          type: 'WALLET_UPDATED',
          target: 'contentScript',
          connected: false
        });
       
        return;
      }

      if (type == 'CONFIRM_CONNECTION' && target == 'background') {
        if (window.senderURL == store.getState().wallet.currentURL) {
          store.dispatch(updateCanConnect(false));

          browser.tabs.sendMessage(tabId, {
            type: 'WALLET_UPDATED',
            target: 'contentScript',
            connected: false
          });

          return;
        }

        return;
      }

      if (type == 'CANCEL_TRANSACTION' && target == 'background') {
        store.dispatch(updateCanConfirmTransaction(false));

        return;
      }

      if (type == 'CLOSE_POPUP' && target == 'background') {
        store.dispatch(updateCanConnect(false));
        store.dispatch(updateCanConfirmTransaction(false));

        browser.tabs.sendMessage(tabId, {
          type: 'WALLET_UPDATED',
          target: 'contentScript',
          connected: false
        });

        browser.tabs.sendMessage(tabId, {
          type: 'DISCONNECT',
          target: 'contentScript'
        });

        return;
      }

      if (type == 'SEND_STATE_TO_PAGE' && target == 'background') {
        browser.tabs.sendMessage(tabId, {
          type: 'SEND_STATE_TO_PAGE',
          target: 'contentScript',
          state: store.getState().wallet
        });
      }

      if (type == 'SEND_CONNECTED_ACCOUNT' && target == 'background') {
        const connectedAccount = store.getState().wallet.accounts.find((account: IAccountState) => {
          return account.connectedTo.find((url) => url === store.getState().wallet.currentURL);
        });

        browser.tabs.sendMessage(tabId, {
          type: 'SEND_CONNECTED_ACCOUNT',
          target: 'contentScript',
          connectedAccount
        });
      }

      if (type == 'SEND_TOKEN' && target == 'background') {
        const {
          fromConnectedAccount,
          toAddress,
          amount,
          fee,
          token,
          isToken
        } = request;

        window.controller.wallet.account.updateTempTx({
          fromAddress: fromConnectedAccount,
          toAddress,
          amount,
          fee,
          token,
          isToken,
          rbf: true
        });

        store.dispatch(updateCanConfirmTransaction(true));

        const URL = browser.runtime.getURL('app.html');

        await createPopup(URL);

        browser.tabs.sendMessage(tabId, {
          type: 'SEND_TOKEN',
          target: 'contentScript',
          complete: true 
        });
      }
    }
  });

  browser.runtime.onConnect.addListener((port) => {
    browser.tabs.query({ active: true })
      .then((tabs) => {
        store.dispatch(updateCurrentURL(tabs[0].url));
      });

    port.onDisconnect.addListener(async () => {
      store.dispatch(updateCanConnect(false));
      store.dispatch(updateCanConfirmTransaction(false));
      
      const all = await browser.windows.getAll();

      if (all.length > 1) {
        const windowId = Number(all[1].id);
        
        await browser.windows.remove(windowId);
      }
    })
  });
});

wrapStore(store, { portName: STORE_PORT });