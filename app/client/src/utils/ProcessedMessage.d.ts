type CallAcceptedMessageWithPayload = {
  type: 'CALL_ACCEPTED';
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

type ProcessedMessage =
  | CallAcceptedMessageWithPayload
  | DeviceDetailsMessageWithPayload;
