import { ipcRenderer, remote } from 'electron';
import ConnectedDevicesService from './features/ConnectedDevicesService';
import PeerConnection from './features/PeerConnection';
import SharingSessionService from './features/SharingSessionsService';
import RoomIDService from './server/RoomIDService';

const roomIDService = remote.getGlobal('roomIDService') as RoomIDService;
const connectedDevicesService = remote.getGlobal(
  'connectedDevicesService'
) as ConnectedDevicesService;
const sharingSessionsService = remote.getGlobal(
  'sharingSessionService'
) as SharingSessionService;

let peerConnection: PeerConnection;

ipcRenderer.on('create-peer-connection-with-data', (_, data) => {
  peerConnection = new PeerConnection(
    data.roomID,
    data.sharingSessionID,
    data.user,
    data.appTheme, // TODO getAppTheme
    data.appLanguage, // TODO getLanguage
    roomIDService,
    connectedDevicesService,
    sharingSessionsService
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

ipcRenderer.on('app-color-theme-changed', (_, newTheme: boolean) => {
  peerConnection.setAppTheme(newTheme);
});

ipcRenderer.on('app-language-changed', (_, newLang: string) => {
  peerConnection.setAppLanguage(newLang);
});
