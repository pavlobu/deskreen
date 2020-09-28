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
    deviceType: string;
    os: string;
    browser: string;
    deviceScreenWidth: number;
    deviceScreenHeight: number;
  };
};

type ProcessedMessage =
  | CallAcceptedMessageWithPayload
  | DeviceDetailsMessageWithPayload;
