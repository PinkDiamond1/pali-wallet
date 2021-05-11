
import React, { Component, useEffect, useState, useCallback } from "react";
import logo from "./assets/images/logosys.svg";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-dropzone-uploader/dist/styles.css';
import FormSPT from "./FormSPT";

const MintSPT = () => {
  const [preview, setPreview] = useState("");
  const [isInstalled, setIsInstalled] = useState(false);
  const [canConnect, setCanConnect] = useState(true);
  const [balance, setBalance] = useState(0);
  const [controller, setController] = useState();
  const [connectedAccount, setConnectedAccount] = useState({});
  const [connectedAccountAddress, setConnectedAccountAddress] = useState('');
  const [amount, setAmount] = useState(0);
  const [fee, setFee] = useState(0.00001);
  const [toAddress, setToAddress] = useState('');
  const [selectedAsset,setSelectedAsset] = useState(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const callback = async (event) => {
      if (event.detail.SyscoinInstalled) {
        setIsInstalled(true);

        if (event.detail.ConnectionsController) {
          setController(window.ConnectionsController);

          return;
        }

        return;
      }

      setIsInstalled(false);

      window.removeEventListener('SyscoinStatus', callback);
    }

    window.addEventListener('SyscoinStatus', callback);
  }, []);

  const handleTypeChanged = useCallback((checked) => {
      setChecked(checked)
  }, []);

  const setup = async () => {
    const state = await controller.getWalletState();

    if (state.accounts.length > 0) {
      controller.getConnectedAccount()
        .then((data) => {
          if (data) {
            setConnectedAccount(data);
            setConnectedAccountAddress(data.address.main);
            setBalance(data.balance);
          } else {
            setConnectedAccount({});
            setConnectedAccountAddress('');
            setBalance(0);
          }      
          return;
        });
    }
  };
  const handleIssueAsset = async (evt) => {
  await controller.handleIssueAsset(
    evt.target.rbf.value,
    evt.target.fee1.value,
    evt.target.assetGuid.value,
    evt.target.amount1.value,
    evt.target.description.value
  )}

  useEffect(() => {
    if (controller) {
      setup();

      controller.onWalletUpdate(setup);
    }
  }, [
    controller,
  ]);
  
  const handleAssetSelected = (event) => {
    if (connectedAccount) {
      const selectedAsset = connectedAccount.assets.filter((asset) => asset.assetGuid == event.target.value);

      if (selectedAsset[0]) {
        setSelectedAsset(selectedAsset[0]);

        return;
      }

      setSelectedAsset(null);
    }
  };

  const handleMessageExtension = async () => {
    await controller.connectWallet();
    await setup();
  }

  const handleGetWalletState = async () => {
    return await controller.getWalletState();
  }

  const clearData = (inputs) => {
    for (let input of inputs) {
      input.value = '';
    }

    setToAddress('');
    setAmount(0);
    setFee(0.00001);
  }

  const handleSendToken = async (sender, receiver, amount, fee, token) => {
    const inputs = document.querySelectorAll('input');

    if (token !== null) {
      await controller.handleSendToken(sender, receiver, amount, fee, token, true, !checked);

      clearData(inputs);

      return;
    }

    await controller.handleSendToken(sender, receiver, amount, fee, null, false, !checked);

    clearData(inputs);

    return;
  }

  return (
    <div className="app">
      {controller ? (  
        <div>  
          <nav className="navbar navbar-expand-lg navbar-light  static-top">
            <div className="container">
              <a className="navbar-brand" href="https://syscoin.org/">
                <img
                  src={logo}
                  alt="logo"
                  className="header__logo"
                />
              </a>
              
              <a
                className="button"
                href="/"
              >
                Home
              </a>

              <div className="collapse navbar-collapse" id="navbarResponsive">
                <ul className="navbar-nav ml-auto">
                  <button
                    className="button"
                    onClick={canConnect ? handleMessageExtension : undefined}
                    disabled={!isInstalled}>
                    {connectedAccountAddress === '' ? 'Connect to Syscoin Wallet' : connectedAccountAddress}
                  </button>
                </ul>
              </div>
            </div>
          </nav>  

          <FormSPT formCallback={handleIssueAsset}/>
        </div>
        ) : (
        <div>
          <p>...</p>
        </div>
      )}
    </div>
    );
  }
  
  export default MintSPT;