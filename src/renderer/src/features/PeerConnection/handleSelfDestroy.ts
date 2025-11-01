import { IpcEvents } from '../../../../common/IpcEvents.enum';
import NullSimplePeer from './NullSimplePeer';
import NullUser from './NullUser';

export default function handleSelfDestroy(peerConnection: PeerConnection): void {
  peerConnection.partner = NullUser;
  window.electron.ipcRenderer.invoke(
    IpcEvents.DisconnectDeviceById,
    peerConnection.partnerDeviceDetails.id,
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
  window.electron.ipcRenderer.invoke(
    IpcEvents.DestroySharingSessionById,
    peerConnection.sharingSessionID,
  );
  peerConnection.onDeviceConnectedCallback = () => {};
  peerConnection.isCallStarted = false;
  peerConnection.socket.disconnect();

  window.electron.ipcRenderer.invoke(IpcEvents.UnmarkRoomIDAsTaken, peerConnection.roomID);
}
