import React, { useEffect, useState } from 'react';
import { Icon, IconButton, Tooltip } from 'components/index';
import { useStore, useUtils } from 'hooks/index';
import { getCurrentTabUrl, getHost } from 'utils/index';
import { getController } from 'utils/browser';
import { Badge } from 'antd';
import { Disclosure, Menu, Transition } from '@headlessui/react';

export const NormalHeader: React.FC = () => {
  const { wallet } = getController();

  const {
    activeNetwork,
    encriptedMnemonic,
    networks,
    activeNetworkType,
    activeChainId,
    whitelist,
  } = useStore();
  const { handleRefresh, navigate } = useUtils();
  const activeAccount = wallet.account.getActiveAccount();

  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [currentTabUrl, setCurrentTabUrl] = useState<string>('');

  const handleChangeNetwork = (value: number) => {
    wallet.switchNetwork(value as number);
    wallet.getNewAddress();
  };

  const setCurrentTabInfo = async () => {
    setCurrentTabUrl(String(await getCurrentTabUrl()));
  };

  useEffect(() => {
    setCurrentTabInfo();
  }, [!wallet.isLocked()]);

  useEffect(() => {
    const whitelistHasCurrentTabUrl = whitelist[getHost(currentTabUrl)];

    if (whitelistHasCurrentTabUrl && whitelistHasCurrentTabUrl.accountId) {
      setIsConnected(whitelistHasCurrentTabUrl.accountId === activeAccount?.id);
    }
  }, [activeAccount, currentTabUrl]);

  // TODO: breakdown NetworkMenu
  const NetworkMenu = () => (
    <Menu
      as="div"
      className="align-center absolute left-2 inline-block mr-8 text-left"
    >
      {(menuprops) => (
        <>
          <Menu.Button className="z-0 inline-flex gap-x-2 items-center justify-start ml-2 w-full text-white text-sm font-medium hover:bg-opacity-30 rounded-full focus:outline-none cursor-pointer">
            <div className="flex gap-x-6 items-center justify-start ml-2 w-full cursor-pointer">
              <div className="flex items-center">
                <div className="border-brand-primary mr-3 px-2 text-brand-white border border rounded-full">
                  <span className="text-xs">
                    {activeNetworkType === 'syscoin'
                      ? 'syscoin'
                      : activeNetworkType === 'web3'
                      ? 'web3'
                      : 'polygon'}
                  </span>
                </div>

                <div>
                  <span style={{ textTransform: 'capitalize' }}>
                    {activeNetwork}
                  </span>
                </div>
              </div>

              <IconButton className="mb-1">
                <Icon
                  name="select-down"
                  className={`${
                    menuprops.open ? 'transform rotate-180' : ''
                  } text-brand-white`}
                  id="network-settings-btn"
                />
              </IconButton>
            </div>
          </Menu.Button>

          <Transition
            as="div"
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
            className="z-40"
          >
            <div className="fixed z-50 -inset-0 w-full bg-brand-black bg-opacity-50 transition-all duration-300 ease-in-out" />

            <Menu.Items
              as="div"
              className="scrollbar-styled absolute z-50 left-0 pb-6 w-72 h-menu text-center text-brand-white font-poppins bg-menu-primary rounded-2xl focus:outline-none shadow-2xl overflow-auto origin-top-right ring-1 ring-black ring-opacity-5"
            >
              <h2
                className="mb-6 pb-6 pt-8 w-full text-center text-brand-white bg-menu-primary border-b border-dashed border-dashed-light"
                id="network-settings-title"
              >
                NETWORK SETTINGS
              </h2>

              <Menu.Item>
                <li
                  onClick={() => navigate('/settings/networks/connected-sites')}
                  className="flex items-center justify-start mb-2 mx-3 px-2 py-1 text-base bg-warning-success hover:bg-opacity-70 border border-solid border-transparent hover:border-warning-success rounded-full cursor-pointer transition-all duration-200"
                >
                  <Icon
                    name="globe"
                    className="mb-1 ml-1 mr-4 text-brand-white"
                  />

                  <span className="px-3">Connected sites</span>
                </li>
              </Menu.Item>

              <Menu.Item>
                <li
                  onClick={() => navigate('/settings/networks/trusted-sites')}
                  className="flex items-center justify-start mb-4 mx-3 px-2 py-1 text-base bg-brand-royalblue hover:bg-opacity-70 border border-solid border-brand-royalblue rounded-full cursor-pointer transition-all duration-200"
                >
                  <Icon
                    name="warning"
                    className="mb-1 ml-1 mr-4 text-brand-white"
                  />

                  <span className="px-3">Trusted sites</span>
                </li>
              </Menu.Item>

              <Menu.Item>
                <Disclosure>
                  {({ open }) => (
                    <>
                      <Disclosure.Button className="flex items-center justify-start px-5 py-3 w-full text-base hover:bg-bkg-3 cursor-pointer transition-all duration-200">
                        <Icon
                          name="dolar"
                          className="ml-1 mr-4 text-brand-white"
                        />

                        <span className="px-3 text-base">Syscoin networks</span>

                        <Icon
                          name="select-down"
                          className={`${
                            open ? 'transform rotate-180' : ''
                          } text-brand-white mb-1`}
                        />
                      </Disclosure.Button>

                      <Disclosure.Panel className="scrollbar-styled pb-2 pt-0.5 h-28 text-sm bg-menu-secondary overflow-auto">
                        {Object.values(networks.syscoin).map(
                          (currentNetwork: any) => (
                            <li
                              key={currentNetwork.chainId}
                              className="backface-visibility-hidden flex flex-col items-center justify-around mt-2 mx-auto p-2.5 max-w-95 text-white text-sm font-medium bg-menu-secondary active:bg-opacity-40 focus:outline-none cursor-pointer transform hover:scale-105 transition duration-300"
                              onClick={() =>
                                handleChangeNetwork(currentNetwork.chainId)
                              }
                            >
                              <span>{currentNetwork.label}</span>

                              {activeChainId === currentNetwork.chainId && (
                                <Icon
                                  name="check"
                                  className="mb-1 w-4"
                                  wrapperClassname="w-6 absolute right-1"
                                />
                              )}
                            </li>
                          )
                        )}
                      </Disclosure.Panel>
                    </>
                  )}
                </Disclosure>
              </Menu.Item>

              <Menu.Item>
                <Disclosure>
                  {({ open }) => (
                    <>
                      <Disclosure.Button className="flex items-center justify-start px-5 py-3 w-full text-base hover:bg-bkg-3 cursor-pointer transition-all duration-200">
                        <Icon
                          name="dolar"
                          className="ml-1 mr-4 text-brand-white"
                        />

                        <span className="px-3 text-base">
                          Ethereum networks
                        </span>

                        <Icon
                          name="select-down"
                          className={`${
                            open ? 'transform rotate-180' : ''
                          } mb-1 text-brand-white`}
                        />
                      </Disclosure.Button>

                      <Disclosure.Panel className="scrollbar-styled pb-2 pt-0.5 h-28 text-sm bg-menu-secondary overflow-auto">
                        {Object.values(networks.web3).map(
                          (currentNetwork: any) => (
                            <li
                              key={currentNetwork.chainId}
                              className="backface-visibility-hidden flex flex-col items-center justify-around mt-2 mx-auto p-2.5 max-w-95 text-white text-sm font-medium bg-menu-secondary active:bg-opacity-40 focus:outline-none cursor-pointer transform hover:scale-105 transition duration-300"
                              onClick={() =>
                                handleChangeNetwork(currentNetwork.chainId)
                              }
                            >
                              <span>{currentNetwork.label}</span>

                              {activeChainId === currentNetwork.chainId && (
                                <Icon
                                  name="check"
                                  className="mb-1 w-4"
                                  wrapperClassname="w-6 absolute right-1"
                                />
                              )}
                            </li>
                          )
                        )}
                      </Disclosure.Panel>
                    </>
                  )}
                </Disclosure>
              </Menu.Item>

              <Menu.Item>
                <Disclosure>
                  {({ open }) => (
                    <>
                      <Disclosure.Button className="flex items-center justify-start px-5 py-3 w-full text-base hover:bg-bkg-3 cursor-pointer transition-all duration-200">
                        <Icon
                          name="dolar"
                          className="ml-1 mr-4 text-brand-white"
                        />

                        <span className="px-3 text-base">Polygon networks</span>

                        <Icon
                          name="select-down"
                          className={`${
                            open ? 'transform rotate-180' : ''
                          } mb-1 text-brand-white`}
                        />
                      </Disclosure.Button>

                      <Disclosure.Panel className="pb-2 pt-0.5 text-sm bg-menu-secondary">
                        {networks.polygon &&
                          Object.values(networks.polygon).map(
                            (currentNetwork: any) => (
                              <li
                                key={currentNetwork.chainId}
                                className="backface-visibility-hidden flex flex-col items-center justify-around mt-2 mx-auto p-2.5 max-w-95 text-white text-sm font-medium bg-menu-secondary active:bg-opacity-40 focus:outline-none cursor-pointer transform hover:scale-105 transition duration-300"
                                onClick={() =>
                                  handleChangeNetwork(currentNetwork.chainId)
                                }
                              >
                                <span>{currentNetwork.label}</span>

                                {activeChainId === currentNetwork.chainId && (
                                  <Icon
                                    name="check"
                                    className="mb-1 w-4"
                                    wrapperClassname="w-6 absolute right-1"
                                  />
                                )}
                              </li>
                            )
                          )}
                      </Disclosure.Panel>
                    </>
                  )}
                </Disclosure>
              </Menu.Item>

              <Menu.Item>
                <li
                  onClick={() => navigate('/settings/networks/custom-rpc')}
                  className="flex items-center justify-start px-5 py-3 w-full text-base hover:bg-bkg-3 cursor-pointer transition-all duration-200"
                >
                  <Icon
                    name="appstoreadd"
                    className="ml-1 mr-4 text-brand-white"
                  />

                  <span className="px-3">Custom RPC</span>
                </li>
              </Menu.Item>

              <Menu.Item>
                <li
                  onClick={() => navigate('/settings/networks/edit')}
                  className="flex items-center justify-start px-5 py-3 w-full text-base hover:bg-bkg-3 cursor-pointer transition-all duration-200"
                >
                  <Icon name="edit" className="ml-1 mr-4 text-brand-white" />

                  <span className="px-3">Edit networks</span>
                </li>
              </Menu.Item>
            </Menu.Items>
          </Transition>
        </>
      )}
    </Menu>
  );

  // TODO: breakdown GeneralMenu
  const GeneralMenu = () => (
    <Menu
      as="div"
      className="absolute right-2 top-2 flex items-center justify-evenly"
    >
      {() => (
        <>
          <Tooltip content={currentTabUrl}>
            <IconButton
              onClick={() => navigate('/settings/networks/connected-sites')}
              className="relative z-0 mx-1.5 text-brand-white"
            >
              <Icon
                name="globe"
                className="hover:text-brand-royalblue text-white"
              />

              <Badge
                className={`${
                  isConnected
                    ? 'text-warning-success bg-warning-succes'
                    : 'text-warning-error bg-warning-error'
                } absolute -right-1 top-1 w-3 h-3 s rounded-full `}
              />
            </IconButton>
          </Tooltip>
          <IconButton
            onClick={handleRefresh}
            className="z-0 mx-1.5 hover:text-brand-deepPink100 text-brand-white"
          >
            <Icon name="reload" />
          </IconButton>

          <Menu.Button
            as="button"
            id="general-settings-button"
            className="z-0 mx-1.5"
          >
            {encriptedMnemonic && (
              <IconButton type="primary" shape="circle">
                <Icon
                  name="settings"
                  className="hover:text-brand-royalblue text-brand-white"
                />
              </IconButton>
            )}
          </Menu.Button>

          <Transition
            as="div"
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <div className="fixed z-40 -inset-0 w-full bg-brand-black bg-opacity-50 transition-all duration-300 ease-in-out" />

            <Menu.Items
              as="div"
              className="scrollbar-styled absolute z-50 right-0 pb-6 w-72 h-96 text-center text-brand-white font-poppins bg-menu-primary rounded-2xl focus:outline-none shadow-2xl overflow-auto origin-top-right ring-1 ring-black ring-opacity-5"
            >
              <h2
                className="mb-6 pb-6 pt-8 w-full text-center text-brand-white bg-menu-primary border-b border-dashed border-dashed-light"
                id="general-settings-title"
              >
                GENERAL SETTINGS
              </h2>

              <Menu.Item>
                <li
                  onClick={() => navigate('/settings/autolock')}
                  className="flex items-center justify-start px-5 py-3 w-full text-base hover:bg-bkg-3 cursor-pointer transition-all duration-200"
                >
                  <Icon name="clock" className="ml-1 mr-4 text-brand-white" />

                  <span className="px-3">Auto lock timer</span>
                </li>
              </Menu.Item>

              <Menu.Item>
                <li
                  onClick={() => navigate('/settings/currency')}
                  className="flex items-center justify-start px-5 py-3 w-full text-base hover:bg-bkg-3 cursor-pointer transition-all duration-200"
                >
                  <Icon name="dolar" className="ml-1 mr-4 text-brand-white" />

                  <span className="px-3">Currency</span>
                </li>
              </Menu.Item>

              <Menu.Item>
                <li
                  onClick={() => navigate('/settings/phrase')}
                  className="flex items-center justify-start px-5 py-3 w-full text-base hover:bg-bkg-3 cursor-pointer transition-all duration-200"
                >
                  <Icon
                    name="wallet"
                    className="ml-1 mr-4 text-brand-white"
                    id="wallet-seed-phrase-btn"
                  />

                  <span className="px-3">Wallet Seed Phrase</span>
                </li>
              </Menu.Item>

              <Menu.Item>
                <li
                  onClick={() => navigate('/settings/about')}
                  className="flex items-center justify-start px-5 py-3 w-full text-base hover:bg-bkg-3 cursor-pointer transition-all duration-200"
                >
                  <Icon
                    name="warning"
                    className="ml-1 mr-4 text-brand-white"
                    id="info-help-btn"
                  />

                  <span className="px-3">Info/Help</span>
                </li>
              </Menu.Item>

              <Menu.Item>
                <li
                  onClick={() => navigate('/settings/delete-wallet')}
                  className="flex items-center justify-start px-5 py-3 w-full text-base hover:bg-bkg-3 cursor-pointer transition-all duration-200"
                >
                  <Icon name="delete" className="ml-1 mr-4 text-brand-white" />

                  <span className="px-3">Delete wallet</span>
                </li>
              </Menu.Item>
            </Menu.Items>
          </Transition>
        </>
      )}
    </Menu>
  );

  return (
    <div className="relative flex items-center justify-between p-2 py-6 w-full text-gray-300 bg-bkg-1">
      <NetworkMenu />

      <GeneralMenu />
    </div>
  );
};
