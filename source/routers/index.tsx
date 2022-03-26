// @ts-nocheck
import React, { useEffect } from 'react';
import {
  Routes,
  Route,
  useLocation,
  useParams,
  Navigate,
} from 'react-router-dom';
import { useQuery, useStore, useUtils } from 'hooks/index';
import { getController } from 'utils/browser';
import { browser } from 'webextension-polyfill-ts';

import {
  About,
  AutoLock,
  ConfirmPhrase,
  ConnectedSites,
  ConnectHardwareWallet,
  CreateAccount,
  CreatePass,
  CreatePhrase,
  Currency,
  CustomRPC,
  DeleteWallet,
  DetailsView,
  EditNetwork,
  Home,
  Import,
  Phrase,
  PrivateKey,
  Receive,
  Send,
  SendConfirm,
  Start,
  TrustedSites,
} from '../pages';

import { ProtectedRoute } from './ProtectedRoute';

export * from './ExternalRoute';

export const Router = () => {
  const params = useParams();
  const controller = getController();

  const { temporaryTransactionState } = useStore();
  const { alert, navigate } = useUtils();
  const { pathname } = useLocation();

  const isUnlocked = !controller.wallet.isLocked();

  useEffect(() => {
    if (isUnlocked) {
      window.addEventListener('mousemove', () => {
        browser.runtime.sendMessage({
          type: 'SET_MOUSE_MOVE',
          target: 'background',
        });
      });
    }
  }, [isUnlocked, browser.runtime]);

  const query = useQuery();
  const route = query.get('route');

  useEffect(() => {
    const route = controller.appRoute();
    const { executing, type } = temporaryTransactionState;

    const hasSendAssetTx = getTemporaryTransaction('sendAsset') !== null;
    const hasUpdateAssetTx = getTemporaryTransaction('updateAsset') !== null;

    if (
      route === '/send/confirm' &&
      !hasSendAssetTx &&
      !executing &&
      type !== 'sendAsset'
    ) {
      navigate('/home');
      return;
    }

    if (route === '/tx/asset/update/confirm' && !hasUpdateAssetTx) {
      navigate('/home');
      return;
    }

    if (!isUnlocked && accounts.length > 0) {
      navigate('/');
      return;
    }

    if (executing && isUnlocked) {
      if (type === 'sendAsset' && hasSendAssetTx) {
        navigate('/send/confirm');
        return;
      }

      switch (type) {
        case 'signAndSendPSBT':
          navigate('/tx/sign');
          return;

        case 'mintNFT':
          navigate('/tx/asset/nft/mint');
          return;

        case 'signPSBT':
          navigate('/tx/sign-psbt');
          return;

        case 'newAsset':
          navigate('/tx/create');
          return;

        case 'mintAsset':
          navigate('/tx/asset/issue');
          return;

        case 'newNFT':
          navigate('/tx/asset/nft/issue');
          return;

        case 'updateAsset':
          navigate('/tx/asset/update');
          return;

        case 'transferAsset':
          navigate('/tx/asset/transfer');
          return;

        default:
          break;
      }
    }

    if (!executing && type !== 'sendAsset' && hasSendAssetTx) {
      navigate('/home');
      return;
    }

    if (isUnlocked) {
      if (canConnect) {
        if (connectedAccount) {
          navigate('/connected-accounts');
          return;
        }

        navigate('/connect-wallet');
        return;
      }

      navigate('/home');
      return;
    }

    if (route !== '/') navigate(route);
  }, [canConnect, isUnlocked]);

  // useEffect(() => {
  //   const appRoute = controller.appRoute();

  //   console.log('app route', appRoute);

  //   if (isUnlocked) {
  //     if (appRoute !== '/app.html' || appRoute !== '/')
  //       return navigate(appRoute);

  //     navigate('/home');
  //   }
  // }, [isUnlocked]);

  useEffect(() => {
    alert.removeAll();
    controller.appRoute(pathname);
  }, [pathname]);

  return (
    <Routes>
      <Route path="/" element={<Start />} />

      <Route path="create-password" element={<CreatePass />} />
      <Route path="import" element={<Import />} />
      <Route path="phrase/create" element={<CreatePhrase />} />
      <Route path="phrase/confirm" element={<ConfirmPhrase />} />

      <Route path="home" element={<ProtectedRoute element={<Home />} />} />
      <Route
        // ? maybe this route should belong to transaction scope
        path="home/tx-details"
        element={<ProtectedRoute element={<DetailsView />} />}
      />

      <Route
        path="/receive"
        element={<ProtectedRoute element={<Receive />} />}
      />

      <Route path="send" element={<ProtectedRoute element={<Send />} />} />
      <Route
        path="send/confirm"
        element={<ProtectedRoute element={<SendConfirm />} />}
      />
      <Route
        path="send/:address"
        element={
          <ProtectedRoute element={<Send initAddress={params.address} />} />
        }
      />

      {/* /settings */}
      <Route path="settings">
        <Route path="about" element={<ProtectedRoute element={<About />} />} />
        <Route
          path="autolock"
          element={<ProtectedRoute element={<AutoLock />} />}
        />
        <Route
          path="currency"
          element={<ProtectedRoute element={<Currency />} />}
        />
        <Route
          path="delete-wallet"
          element={<ProtectedRoute element={<DeleteWallet />} />}
        />
        <Route
          path="phrase"
          element={<ProtectedRoute element={<Phrase />} />}
        />

        {/* /settings/account */}
        <Route path="account">
          <Route
            path="hardware"
            element={<ProtectedRoute element={<ConnectHardwareWallet />} />}
          />
          <Route
            path="new"
            element={<ProtectedRoute element={<CreateAccount />} />}
          />
          <Route
            path="private-key"
            element={<ProtectedRoute element={<PrivateKey />} />}
          />
        </Route>

        {/* /settings/networks */}
        <Route path="networks">
          <Route
            path="connected-sites"
            element={<ProtectedRoute element={<ConnectedSites />} />}
          />
          <Route
            path="custom-rpc"
            element={<ProtectedRoute element={<CustomRPC />} />}
          />
          <Route
            path="edit"
            element={<ProtectedRoute element={<EditNetwork />} />}
          />
          <Route
            path="trusted-sites"
            element={<ProtectedRoute element={<TrustedSites />} />}
          />
        </Route>
      </Route>

      <Route path="app.html" element={<Navigate to={{ pathname: '/' }} />} />
    </Routes>
  );
};
