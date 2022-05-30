import uuid from 'uuid';
import { process as processMessage } from '../../utils/message';

export function handleDeviceIPMessage(
  deviceIP: string,
  peerConnection: PeerConnection,
  message: ProcessedMessage
) {
  if (message.type !== 'DEVICE_DETAILS') return;
  const device = {
    id: uuid.v4(),
    deviceIP,
    deviceType: message.payload.deviceType,
    deviceOS: message.payload.os,
    deviceBrowser: message.payload.browser,
    deviceScreenWidth: message.payload.deviceScreenWidth,
    deviceScreenHeight: message.payload.deviceScreenHeight,
    sharingSessionID: peerConnection.sharingSessionID,
  };
  peerConnection.partnerDeviceDetails = device;
  peerConnection.onDeviceConnectedCallback(device);
}

export default async function handleRecieveEncryptedMessage(
  peerConnection: PeerConnection,
  payload: ReceiveEncryptedMessagePayload
) {
  const message = await processMessage(payload, peerConnection.user.privateKey);
  if (message.type === 'CALL_ACCEPTED') {
    peerConnection.peer.signal(message.payload.signalData);
  }
  if (message.type === 'DEVICE_DETAILS') {
    peerConnection.socket.emit(
      'GET_IP_BY_SOCKET_ID',
      payload.fromSocketID,
      (deviceIP: string) => {
        // TODO: need to add myIP in client message.payload.myIP, then if retrieved deviceIP and myIP from client don't match, we were spoofed, then we can interrupt connection immediately!
        handleDeviceIPMessage(deviceIP, peerConnection, message);
      }
    );
  }
  if (message.type === 'GET_APP_THEME') {
    peerConnection.sendEncryptedMessage({
      type: 'APP_THEME',
      payload: {
        // value: settings.hasSync('appIsDarkTheme')
        //   ? settings.getSync('appIsDarkTheme') === 'true'
        //   : false,
        value: true,
      },
    });
  }
  if (message.type === 'GET_APP_LANGUAGE') {
    peerConnection.sendEncryptedMessage({
      type: 'APP_LANGUAGE',
      payload: {
        // value: settings.hasSync('appLanguage')
        //   ? settings.getSync('appLanguage')
        //   : 'en',
        value: 'en',
      },
    });
  }
}
