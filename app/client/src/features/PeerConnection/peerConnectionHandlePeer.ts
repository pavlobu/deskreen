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

let lastFramesReceived = 0;
let lastCalculatedFPS = 0;
let lastCalculatedFPSTimestamp = 0;

function dumpStatsFramesPerSecondOnly(results: any) {
  // framesReceived
  let isFremsPerSecondSet;
  let statsString = '';

  results.forEach((res: any) => {
    // statsString += '<h3>Report type=';
    // statsString += res.type;
    // statsString += '</h3>\n';
    // statsString += `id ${res.id}<br>`;
    // statsString += `time ${res.timestamp}<br>`;
    Object.keys(res).forEach(k => {
      if (k.includes('framesPerSecond') && k !== 'timestamp' && k !== 'type' && k !== 'id') {
        // statsString += `${k}: ${res[k]}<br>`;
        const fpsElement = document.getElementById('fps-show');
        if (fpsElement) {
          fpsElement.innerHTML = res[k];
        }
        isFremsPerSecondSet = true;
      }

      if (k.includes('framesReceived') && k !== 'timestamp' && k !== 'type' && k !== 'id') {
        const currentTime = new Date().getTime();
        const currentFramesReceived = parseInt(res[k], 10);

        if (lastFramesReceived === 0) {
          lastFramesReceived = currentFramesReceived;
          lastCalculatedFPSTimestamp = currentTime;
          return;
        }
        const framesDifference = currentFramesReceived - lastFramesReceived;
        console.log('framesDifference', framesDifference);

        const timeDifference = currentTime - lastCalculatedFPSTimestamp;
        console.log('timeDifference', timeDifference);
        const howManyTimesTimeDifferenceIsMorThanOneSecond = timeDifference / 1000;
        console.log('howManyTimesTimeDifferenceIsMorThanOneSecond', howManyTimesTimeDifferenceIsMorThanOneSecond);

        lastCalculatedFPS = Math.floor(framesDifference / howManyTimesTimeDifferenceIsMorThanOneSecond);
        lastFramesReceived = currentFramesReceived;
        lastCalculatedFPSTimestamp = currentTime;
      }
    });
  });
  if (!isFremsPerSecondSet) {
    const fpsElement = document.getElementById('fps-show');
    if (fpsElement) {
      fpsElement.innerHTML = `~${lastCalculatedFPS}`;
    }
  }
  // return statsString;
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

    setInterval(() => {
      // console.log('peerConnection framerate', peerConnection.peer);
      // @ts-ignore
      if (peerConnection.peer && peerConnection.peer._pc) {
        // @ts-ignore
        peerConnection.peer._pc.getStats(null).then((results: any) => {
          dumpStatsFramesPerSecondOnly(results);
        });
      }
    }, 2000);

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
