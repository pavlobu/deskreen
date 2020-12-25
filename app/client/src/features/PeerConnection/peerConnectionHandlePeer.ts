import {
  prepareDataMessageToChangeQuality,
  prepareDataMessageToGetSharingSourceType,
} from './simplePeerDataMessages';
import { VideoQuality } from '../VideoAutoQualityOptimizer/VideoQualityEnum';
import PeerConnectionPeerIsNullError from './errors/PeerConnectionPeerIsNullError';
import ScreenSharingSource from './ScreenSharingSourceEnum';

export function getSharingShourceType(peerConnection: PeerConnection) {
  try {
    peerConnection.peer?.send(prepareDataMessageToGetSharingSourceType());
  } catch (e) {
    console.log(e);
  }
}

export default (peerConnection: PeerConnection) => {
  if (peerConnection.peer === null) {
    throw new PeerConnectionPeerIsNullError();
  }
  peerConnection.peer.on('stream', (stream) => {
    peerConnection.setUrlCallback(stream);

    setTimeout(() => {
      peerConnection.videoAutoQualityOptimizer.setGoodQualityCallback(() => {
        if (peerConnection.videoQuality === VideoQuality.Q_AUTO) {
          try {
            peerConnection.peer?.send(prepareDataMessageToChangeQuality(1));
          } catch (e) {
            console.log(e);
          }
        }
      });

      peerConnection.videoAutoQualityOptimizer.setHalfQualityCallbak(() => {
        if (peerConnection.videoQuality === VideoQuality.Q_AUTO) {
          try {
            peerConnection.peer?.send(prepareDataMessageToChangeQuality(0.5));
          } catch (e) {
            console.log(e);
          }
        }
      });
    }, 1000);

    peerConnection.videoAutoQualityOptimizer.startOptimizationLoop();

    setTimeout(getSharingShourceType, 1000, peerConnection);

    peerConnection.isStreamStarted = true;
  });

  peerConnection.peer.on('signal', (data) => {
    // fired when webrtc done preparation to start call on peerConnection machine
    peerConnection.sendEncryptedMessage({
      type: 'CALL_ACCEPTED',
      payload: {
        signalData: data,
      },
    });
  });

  peerConnection.peer.on('data', (data) => {
    const dataJSON = JSON.parse(data);

    if (dataJSON.type === 'screen_sharing_source_type') {
      peerConnection.screenSharingSourceType = dataJSON.payload.value;
      if (
        peerConnection.screenSharingSourceType === ScreenSharingSource.SCREEN ||
        peerConnection.screenSharingSourceType === ScreenSharingSource.WINDOW
      ) {
        peerConnection.UIHandler.setScreenSharingSourceTypeCallback(
          peerConnection.screenSharingSourceType
        );
      }
    }
  });
};
