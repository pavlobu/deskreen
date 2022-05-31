import { ipcRenderer } from 'electron';
import PeerConnection from './features/PeerConnection';

// eslint-disable-next-line import/prefer-default-export
export function handleIpcRenderer() {
  ipcRenderer.on('start-peer-connection', () => {
    let peerConnection: PeerConnection;

    ipcRenderer.on('create-peer-connection-with-data', (_, data) => {
      peerConnection = new PeerConnection(
        data.roomID,
        data.sharingSessionID,
        data.user
      );

      peerConnection.setOnDeviceConnectedCallback((deviceData) => {
        ipcRenderer.send('peer-connected', deviceData);
      });
    });

    ipcRenderer.on('set-desktop-capturer-source-id', (_, id) => {
      peerConnection.setDesktopCapturerSourceID(id);
    });

    ipcRenderer.on('call-peer', () => {
      peerConnection.callPeer();
    });

    ipcRenderer.on('disconnect-by-host-machine-user', (_, deviceId: string) => {
      peerConnection.disconnectByHostMachineUser(deviceId);
    });

    ipcRenderer.on('deny-connection-for-partner', () => {
      peerConnection.denyConnectionForPartner();
    });

    ipcRenderer.on('send-user-allowed-to-connect', () => {
      peerConnection.sendUserAllowedToConnect();
    });

    ipcRenderer.on('app-color-theme-changed', () => {
      peerConnection.notifyClientWithNewColorTheme();
    });

    ipcRenderer.on('app-language-changed', () => {
      peerConnection.notifyClientWithNewLanguage();
    });
  });
}

handleIpcRenderer();
