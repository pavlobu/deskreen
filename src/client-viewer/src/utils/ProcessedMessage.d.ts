type CallUserMessageWithPayload = {
  type: 'CALL_USER';
  payload: {
    signalData: string;
  };
};

type DeviceDetailsMessageWithPayload = {
  type: 'DEVICE_DETAILS';
  payload: {
    socketID: string;
    deviceType: { type: string };
    os: { name: string; version: string };
    browser: { name: string; version: string; major: string };
    deviceScreenWidth: number;
    deviceScreenHeight: number;
  };
};

type DenyToConnectMessageWithPayload = {
  type: 'DENY_TO_CONNECT';
  payload: {};
};

type DisconnectByHostMachineUserMessageWithPayload = {
  type: 'DISCONNECT_BY_HOST_MACHINE_USER';
  payload: {};
};

type AllowedToConnectMessageWithPayload = {
  type: 'ALLOWED_TO_CONNECT';
  payload: {};
};

type AppLanguageMessageWithPayload = {
  type: 'APP_LANGUAGE';
  payload: {
    value: string;
  };
};

type ProcessedMessage =
  | CallUserMessageWithPayload
  | DeviceDetailsMessageWithPayload
  | DenyToConnectMessageWithPayload
  | DisconnectByHostMachineUserMessageWithPayload
  | AllowedToConnectMessageWithPayload
  | AppLanguageMessageWithPayload;
