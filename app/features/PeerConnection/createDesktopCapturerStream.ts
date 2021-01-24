/* eslint-disable promise/catch-or-return */
import getDesktopSourceStreamBySourceID from './getDesktopSourceStreamBySourceID';
import Logger from '../../utils/LoggerWithFilePrefix';
import DesktopCapturerSourceType from '../DesktopCapturerSourcesService/DesktopCapturerSourceType';

const log = new Logger(__filename);

export default async function createDesktopCapturerStream(
  peerConnection: PeerConnection,
  sourceID: string
) {
  try {
    if (process.env.RUN_MODE === 'test') return;

    if (sourceID.includes(DesktopCapturerSourceType.SCREEN)) {
      const stream = await getDesktopSourceStreamBySourceID(
        sourceID,
        peerConnection.sourceDisplaySize?.width,
        peerConnection.sourceDisplaySize?.height,
        0.5,
        1
      );
      peerConnection.localStream = stream;
    } else {
      // when source is app window
      const stream = await getDesktopSourceStreamBySourceID(sourceID);
      peerConnection.localStream = stream;
    }
  } catch (e) {
    log.error(e);
  }
}
