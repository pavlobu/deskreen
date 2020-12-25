import SimplePeer from 'simple-peer';
import createDesktopCapturerStream from './createDesktopCapturerStream';
import handlePeerOnData from './handlePeerOnData';
// import setSdpMediaBitrate from './setSdpMediaBitrate';
import Logger from '../../utils/LoggerWithFilePrefix';
import NullSimplePeer from './NullSimplePeer';
import simplePeerHandleSdpTransform from './simplePeerHandleSdpTransform';

const log = new Logger(__filename);

export default function handleCreatePeer(peerConnection: PeerConnection) {
  return new Promise((resolve, reject) => {
    createDesktopCapturerStream(
      peerConnection,
      peerConnection.desktopCapturerSourceID
    )
      .then(() => {
        // eslint-disable-next-line promise/always-return
        if (peerConnection.peer === NullSimplePeer) {
          peerConnection.peer = new SimplePeer({
            initiator: true,
            config: { iceServers: [] },
            sdpTransform: simplePeerHandleSdpTransform,
          });
        }

        // eslint-disable-next-line promise/always-return
        if (peerConnection.localStream !== null) {
          peerConnection.peer.addStream(peerConnection.localStream);
        }

        peerConnection.peer.on('signal', (data: string) => {
          // fired when simple peer and webrtc done preparation to start call on peerConnection machine
          peerConnection.signalsDataToCallUser.push(data);
        });

        peerConnection.peer.on('data', (data) => {
          handlePeerOnData(peerConnection, data);
        });
        resolve(undefined);
      })
      .catch((e) => {
        log.error(e);
        reject();
      });
  });
}
