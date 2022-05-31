import { ipcRenderer } from 'electron';
import { IpcEvents } from '../../main/IpcEvents.enum';
import NullSimplePeer from './NullSimplePeer';
import NullUser from './NullUser';

export default function handleSelfDestroy(peerConnection: PeerConnection) {
  peerConnection.partner = NullUser;
  ipcRenderer.invoke(
    IpcEvents.DisconnectDeviceById,
    peerConnection.partnerDeviceDetails.id
  );
  if (peerConnection.peer !== NullSimplePeer) {
    peerConnection.peer.destroy();
  }
  if (peerConnection.localStream) {
    peerConnection.localStream.getTracks().forEach((track) => {
      track.stop();
    });
    peerConnection.localStream = null;
  }
  ipcRenderer.invoke(
    IpcEvents.DestroySharingSessionById,
    peerConnection.sharingSessionID
  );
  peerConnection.onDeviceConnectedCallback = () => {};
  peerConnection.isCallStarted = false;
  peerConnection.socket.disconnect();

  ipcRenderer.invoke(IpcEvents.UnmarkRoomIDAsTaken, peerConnection.roomID);
}
