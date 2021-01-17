import SharingSessionStatusEnum from '../SharingSessionService/SharingSessionStatusEnum';
import NullSimplePeer from './NullSimplePeer';
import NullUser from './NullUser';

export default function handleSelfDestroy(peerConnection: PeerConnection) {
  peerConnection.partner = NullUser;
  peerConnection.connectedDevicesService.removeDeviceByID(
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
  const sharingSession = peerConnection.sharingSessionService.sharingSessions.get(
    peerConnection.sharingSessionID
  );
  sharingSession?.setStatus(SharingSessionStatusEnum.DESTROYED);
  sharingSession?.destroy();
  peerConnection.sharingSessionService.sharingSessions.delete(
    peerConnection.sharingSessionID
  );
  peerConnection.onDeviceConnectedCallback = () => {};
  peerConnection.isCallStarted = false;
  peerConnection.socket.disconnect();
  peerConnection.roomIDService.unmarkRoomIDAsTaken(peerConnection.roomID);
}
