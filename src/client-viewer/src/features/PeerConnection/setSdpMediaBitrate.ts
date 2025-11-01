export default (sdp: string, mediaType: string, bitrate: number) => {
  const sdpLines = sdp.split('\n');
  let mediaLineIndex = -1;
  const mediaLine = `m=${mediaType}`;
  let bitrateLineIndex = -1;
  const bitrateLine = `b=AS:${bitrate}`;
  mediaLineIndex = sdpLines.findIndex((line) => line.startsWith(mediaLine));

  // If we find a line matching “m={mediaType}”
  if (mediaLineIndex && mediaLineIndex < sdpLines.length) {
    // Skip the media line
    bitrateLineIndex = mediaLineIndex + 1;

    // Skip both i=* and c=* lines (bandwidths limiters have to come afterwards)
    while (
      sdpLines[bitrateLineIndex].startsWith('i=') ||
      sdpLines[bitrateLineIndex].startsWith('c=')
    ) {
      bitrateLineIndex += 1;
    }

    if (sdpLines[bitrateLineIndex].startsWith('b=')) {
      // If the next line is a b=* line, replace it with our new bandwidth
      sdpLines[bitrateLineIndex] = bitrateLine;
    } else {
      // Otherwise insert a new bitrate line.
      sdpLines.splice(bitrateLineIndex, 0, bitrateLine);
    }
  }

  // Then return the updated sdp content as a string
  return sdpLines.join('\n');
};
