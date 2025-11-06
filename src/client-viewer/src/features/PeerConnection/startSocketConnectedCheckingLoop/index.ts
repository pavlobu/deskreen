import PeerConnection from '..';
import { ErrorMessage } from '../../../components/ErrorDialog/ErrorMessageEnum';
import setAndShowErrorDialogMessage from '../setAndShowErrorDialogMessage';

export default (peerConnection: PeerConnection) => {
  let disconnectedStreak = 0;
  let pingTimeout: NodeJS.Timeout | null = null;
  
  const checkConnection = () => {
    const isSocketConnected = !!peerConnection.socket?.connected;
    
    if (isSocketConnected) {
      // perform explicit ping/pong check to verify server is alive
      try {
        if (pingTimeout) {
          clearTimeout(pingTimeout);
        }
        
        const timeout = setTimeout(() => {
          // ping timeout - server didn't respond
          disconnectedStreak++;
          handleDisconnection();
        }, 3000);
        
        pingTimeout = timeout;
        
        peerConnection.socket.emit('PING', (response: string) => {
          if (pingTimeout) {
            clearTimeout(pingTimeout);
            pingTimeout = null;
          }
          
          if (response === 'PONG') {
            disconnectedStreak = 0;
          } else {
            disconnectedStreak++;
            handleDisconnection();
          }
        });
      } catch {
        // socket error during ping
        disconnectedStreak++;
        handleDisconnection();
      }
    } else {
      // socket is not connected
      disconnectedStreak++;
      handleDisconnection();
    }
  };
  
  const handleDisconnection = () => {
    // show error and stop stream after sustained disconnection
    if (disconnectedStreak >= 3) {
      // stop the video stream
      if (peerConnection.isStreamStarted) {
        peerConnection.stopStream();
      }
      // show error dialog (now allows showing even when stream was started)
      setAndShowErrorDialogMessage(peerConnection, ErrorMessage.DISCONNECTED);
    }
  };
  
  setInterval(checkConnection, 5000);
};
