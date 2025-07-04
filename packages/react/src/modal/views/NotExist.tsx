import { DownloadInfo } from '@interchain-kit/core';
import { WalletStore } from '@interchain-kit/store';
import { ConnectModalHead, ConnectModalStatus } from '@interchain-ui/react';
import { FaAndroid } from '@react-icons/all-files/fa/FaAndroid';
import { GoDesktopDownload } from '@react-icons/all-files/go/GoDesktopDownload';
import { GrFirefox } from '@react-icons/all-files/gr/GrFirefox';
import { RiAppStoreFill } from '@react-icons/all-files/ri/RiAppStoreFill';
import { RiChromeFill } from '@react-icons/all-files/ri/RiChromeFill';
import { useMemo } from 'react';

export const NotExistHeader = ({
  wallet,
  close,
  onBack,
}: {
  wallet: WalletStore;
  close: () => void;
  onBack: () => void;
}) => {
  return (
    <ConnectModalHead
      title={wallet?.info?.prettyName || ''}
      hasBackButton={true}
      onClose={close}
      onBack={onBack}
      closeButtonProps={{ onClick: close }}
    />
  );
};

export const NotExistContent = ({
  wallet,
  getDownloadLink,
  getEnv,
}: {
  wallet: WalletStore;
  getDownloadLink: (walletName: string) => DownloadInfo;
  getEnv: () => { browser?: string; device?: string; os?: string };
}) => {
  const downloadLink = useMemo(() => {
    return getDownloadLink(wallet.info.name);
  }, [wallet?.info?.name]);

  const onInstall = () => {
    if (downloadLink) {
      window.open(downloadLink.link, '_blank');
    }
  };

  const IconComp = getIcon(getEnv());

  return (
    <ConnectModalStatus
      status="NotExist"
      wallet={{
        name: wallet?.info?.prettyName,
        logo: typeof wallet?.info?.logo === 'string' ? wallet?.info?.logo : '',
        mobileDisabled: true,
      }}
      contentHeader={`${wallet?.info?.prettyName} Not Installed`}
      contentDesc={`If ${wallet?.info?.prettyName.toLowerCase()} is installed on your device, please refresh this page or follow the browser instruction.`}
      onInstall={onInstall}
      installIcon={<IconComp />}
      disableInstall={downloadLink === null}
    />
  );
};

function getIcon(env: { browser?: string; device?: string; os?: string }) {
  if (env?.browser === 'chrome') return RiChromeFill;
  if (env?.browser === 'firefox') return GrFirefox;
  if (env?.os === 'android') return FaAndroid;
  if (env?.os === 'ios') return RiAppStoreFill;
  return GoDesktopDownload;
}
