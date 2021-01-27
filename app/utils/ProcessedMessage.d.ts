type CallAcceptedMessageWithPayload = {
  type: 'CALL_ACCEPTED';
  payload: {
    signalData: string;
  };
};

type DeviceDetailsMessageWithPayload = {
  type: 'DEVICE_DETAILS';
  payload: {
    deviceType: string;
    os: string;
    browser: string;
    deviceScreenWidth: number;
    deviceScreenHeight: number;
  };
};

type GetAppThemeMessageWithPayload = {
  type: 'GET_APP_THEME';
  payload: Record<string, unknown>;
};

type GetAppLanguageMessageWithPayload = {
  type: 'GET_APP_LANGUAGE';
  payload: Record<string, unknown>;
};

type ProcessedMessage =
  | CallAcceptedMessageWithPayload
  | DeviceDetailsMessageWithPayload
  | GetAppThemeMessageWithPayload
  | GetAppLanguageMessageWithPayload;
