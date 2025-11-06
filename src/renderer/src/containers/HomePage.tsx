import React, { useCallback, useState } from 'react';
import { Classes } from '@blueprintjs/core';
import { ToastProvider, DefaultToast } from 'react-toast-notifications';

import { LIGHT_UI_BACKGROUND } from './SettingsProvider';
import DeskreenStepper from './DeskreenStepper';
import { Device } from '../../../common/Device';
import TopPanel from '@renderer/components/TopPanel';
import { IpcEvents } from '../../../common/IpcEvents.enum';

// @ts-ignore: it is ok here, be like js it is fine
// eslint-disable-next-line react/prop-types
export const CustomToastWithTheme = ({ children, ...props }): React.ReactElement => {
  return (
    <DefaultToast
      components={{ Toast: CustomToastWithTheme }}
      {...props}
      // @ts-ignore: some minor type complain, it is fine here
      style={{
        color: '#293742',
        backgroundColor: LIGHT_UI_BACKGROUND,
      }}
    >
      <>{children}</>
    </DefaultToast>
  );
};

export default function HomePage(): React.ReactElement {
  console.log('window.api', window.api);
  const [activeStep, setActiveStep] = useState(0);
  const [isAllowDeviceAlertOpen, setIsAllowDeviceAlertOpen] = useState(false);
  const [isUserAllowedConnection, setIsUserAllowedConnection] = useState(false);
  const [pendingConnectionDevice, setPendingConnectionDevice] = useState<Device | null>(null);

  const handleResetWithSharingSessionRestart = useCallback(async (): Promise<void> => {
    setActiveStep(0);
    setPendingConnectionDevice(null);
    setIsUserAllowedConnection(false);
    setIsAllowDeviceAlertOpen(false);

    await window.electron.ipcRenderer.invoke(IpcEvents.ResetWaitingForConnectionSharingSession);
    await window.electron.ipcRenderer.invoke(IpcEvents.CreateWaitingForConnectionSharingSession);
  }, []);

  return (
    <ToastProvider
      placement="top-center"
      autoDismissTimeout={5000}
      components={{ Toast: CustomToastWithTheme }}
    >
      <div className={Classes.TREE}>
        <TopPanel handleReset={handleResetWithSharingSessionRestart} />
        <DeskreenStepper
          activeStep={activeStep}
          setActiveStep={setActiveStep}
          isAllowDeviceAlertOpen={isAllowDeviceAlertOpen}
          setIsAllowDeviceAlertOpen={setIsAllowDeviceAlertOpen}
          isUserAllowedConnection={isUserAllowedConnection}
          setIsUserAllowedConnection={setIsUserAllowedConnection}
          pendingConnectionDevice={pendingConnectionDevice}
          setPendingConnectionDevice={setPendingConnectionDevice}
          handleReset={handleResetWithSharingSessionRestart}
        />
      </div>
    </ToastProvider>
  );
}
