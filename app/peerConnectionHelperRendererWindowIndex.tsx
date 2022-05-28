// import { ipcRenderer, remote } from 'electron';
import { ipcRenderer } from 'electron';
import ConnectedDevicesService from './features/ConnectedDevicesService';
import DesktopCapturerSourcesService from './features/DesktopCapturerSourcesService';
import PeerConnection from './features/PeerConnection';
import SharingSessionService from './features/SharingSessionService';
import RoomIDService from './server/RoomIDService';

// eslint-disable-next-line import/prefer-default-export
export function handleIpcRenderer() {
  ipcRenderer.on('start-peer-connection', () => {
    // const desktopCapturerSourcesService = remote.getGlobal(
    //   'desktopCapturerSourcesService'
    // ) as DesktopCapturerSourcesService;
    // const roomIDService = remote.getGlobal('roomIDService') as RoomIDService;
    // const connectedDevicesService = remote.getGlobal(
    //   'connectedDevicesService'
    // ) as ConnectedDevicesService;
    // const sharingSessionService = remote.getGlobal(
    //   'sharingSessionService'
    // ) as SharingSessionService;

    let peerConnection: PeerConnection;

    ipcRenderer.on('create-peer-connection-with-data', (_, data) => {
      peerConnection = new PeerConnection(
        data.roomID,
        data.sharingSessionID,
        data.user
        // roomIDService,
        // connectedDevicesService,
        // sharingSessionService,
        // desktopCapturerSourcesService
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

    ipcRenderer.on('disconnect-by-host-machine-user', () => {
      peerConnection.disconnectByHostMachineUser();
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
