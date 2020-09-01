/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable react/prop-types */
import React, { useState, useCallback } from 'react';

interface ConnectedDevicesContextInterface {
  devices: Device[];
  pendingConnectionDevice: Device | null;
  setPendingConnectionDeviceHook: (device: Device) => void;
  addPendingConnectedDeviceListener: (
    callback: (device: Device) => void
  ) => void;
  setDevicesHook: (devices: Device[]) => void;
  resetPendingConnectionDeviceHook: () => void;
  getDevices: () => Device[];
}

// TODO this value should be set as soon as electron-ConnectedDevices is loaded, to load user pref
const defaultConnectedDevicesContextValue = {
  devices: [] as Device[],
  pendingConnectionDevice: null,
  setPendingConnectionDeviceHook: () => {},
  addPendingConnectedDeviceListener: () => {},
  setDevicesHook: () => {},
  resetPendingConnectionDeviceHook: () => {},
  getDevices: () => [] as Device[],
};

export const ConnectedDevicesContext = React.createContext<
  ConnectedDevicesContextInterface
>(defaultConnectedDevicesContextValue);

export const ConnectedDevicesProvider: React.FC = ({ children }) => {
  const [devices, setDevices] = useState([] as Device[]);
  const [
    pendingConnectionDevice,
    setPendingConnectionDevice,
  ] = useState<Device | null>();
  const [
    pendingDeviceConnectedListeners,
    setPendingDeviceConnectedListeners,
  ] = useState([]);

  const emitPendingConnectionDeviceConnected = useCallback(
    (device: Device) => {
      pendingDeviceConnectedListeners.forEach(
        (callback: (device: Device) => void) => {
          callback(device);
        }
      );
    },
    [pendingDeviceConnectedListeners]
  );

  const setPendingConnectionDeviceHook = (device: Device) => {
    setPendingConnectionDevice(device);
    emitPendingConnectionDeviceConnected(device);
  };

  const setDevicesHook = (_devices: Device[]) => {
    setDevices(_devices);
  };

  const resetPendingConnectionDeviceHook = () => {
    setPendingConnectionDevice(undefined);
  };

  const addPendingConnectedDeviceListener = (
    callback: (device: Device) => void
  ) => {
    // @ts-ignore: has to be like that for now
    setPendingDeviceConnectedListeners([
      ...pendingDeviceConnectedListeners,
      callback,
    ]);
  };

  const getDevices = useCallback(() => {
    return devices;
  }, [devices]);

  // TODO: load saved devices here? in useEffect

  const value = {
    devices,
    pendingConnectionDevice,
    setDevicesHook,
    setPendingConnectionDeviceHook,
    addPendingConnectedDeviceListener,
    resetPendingConnectionDeviceHook,
    getDevices,
  };

  return (
    // @ts-ignore: it is ok here
    <ConnectedDevicesContext.Provider value={value}>
      {children}
    </ConnectedDevicesContext.Provider>
  );
};
