import DesktopCapturerSourceType from '../../../../common/DesktopCapturerSourceType';
import getDesktopSourceStreamBySourceID from './getDesktopSourceStreamBySourceID';
import prepareDataMessageToSendScreenSourceType from './prepareDataMessageToSendScreenSourceType';
import NullSimplePeer from './NullSimplePeer';

export default async function handlePeerOnData(
  peerConnection: PeerConnection,
  data: string,
): Promise<void> {
  const dataJSON = JSON.parse(data);

  if (dataJSON.type === 'set_video_quality') {
    const maxVideoQualityMultiplier = dataJSON.payload.value;
    const minVideoQualityMultiplier =
      maxVideoQualityMultiplier === 1 ? 0.5 : maxVideoQualityMultiplier;

    if (!peerConnection.desktopCapturerSourceID.includes(DesktopCapturerSourceType.SCREEN)) return;

    const newStream = await getDesktopSourceStreamBySourceID(
      peerConnection.desktopCapturerSourceID,
      peerConnection.sourceDisplaySize?.width,
      peerConnection.sourceDisplaySize?.height,
      minVideoQualityMultiplier,
      maxVideoQualityMultiplier,
    );
    const newVideoTrack = newStream.getVideoTracks()[0];
    const oldStream = peerConnection.localStream;
    const oldTrack = oldStream?.getVideoTracks()[0];

    if (oldTrack && oldStream && peerConnection.peer !== NullSimplePeer) {
      peerConnection.peer.replaceTrack(oldTrack, newVideoTrack, oldStream);
      // stop all tracks in old stream to ensure full cleanup
      oldStream.getTracks().forEach((track) => {
        track.stop();
      });
    }
    
    // update local stream reference to new stream
    peerConnection.localStream = newStream;
  }

  if (dataJSON.type === 'get_sharing_source_type') {
    const sourceType = peerConnection.desktopCapturerSourceID.includes(
      DesktopCapturerSourceType.SCREEN,
    )
      ? DesktopCapturerSourceType.SCREEN
      : DesktopCapturerSourceType.WINDOW;

    peerConnection.peer.send(prepareDataMessageToSendScreenSourceType(sourceType));
  }
}
