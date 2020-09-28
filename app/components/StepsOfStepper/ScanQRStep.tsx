/* eslint-disable @typescript-eslint/ban-ts-comment */
import { clipboard, remote } from 'electron';
import React, { useContext, useEffect, useState } from 'react';
import { Button, Text, Tooltip, Position, H2, Dialog } from '@blueprintjs/core';
import QRCode from 'qrcode.react';
import { makeStyles, createStyles } from '@material-ui/core';
import { Row, Col } from 'react-flexbox-grid';
import { SettingsContext } from '../../containers/SettingsProvider';
import isProduction from '../../utils/isProduction';
import CloseOverlayButton from '../CloseOverlayButton';
import SharingSessionService from '../../features/SharingSessionsService';

const sharingSessionService = remote.getGlobal(
  'sharingSessionService'
) as SharingSessionService;

const LOCAL_LAN_IP =
  process.env.RUN_MODE === 'dev' || process.env.NODE_ENV === 'production'
    ? require('internal-ip').v4.sync()
    : '255.255.255.255';

// TODO: change 3131 to user defined port, if it is really defined
const CLIENT_VIEWER_PORT = isProduction() ? '3131' : '3000';

const useStyles = makeStyles(() =>
  createStyles({
    smallQRCode: {
      border: '1px solid',
      borderColor: 'rgba(0,0,0,0.0)',
      padding: '10px',
      borderRadius: '10px',
      '&:hover': {
        backgroundColor: 'rgba(0,0,0,0.12)',
        border: '1px solid #8A9BA8',
        cursor: 'zoom-in',
      },
    },
    dialogQRWrapper: {
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '10px',
    },
    bigQRCodeDialogRoot: {
      '&:hover': {
        cursor: 'zoom-out',
      },
    },
  })
);

const ScanQRStep: React.FC = () => {
  const classes = useStyles();
  const { isDarkTheme } = useContext(SettingsContext);

  const [roomID, setRoomID] = useState('');

  useEffect(() => {
    const thisInterval = setInterval(() => {
      if (sharingSessionService.waitingForConnectionSharingSession !== null) {
        setRoomID(
          sharingSessionService.waitingForConnectionSharingSession.roomID
        );
      }
    }, 1000);

    return () => {
      clearInterval(thisInterval);
    };
  }, []);

  const [isQRCodeMagnified, setIsQRCodeMagnified] = useState(false);

  return (
    <>
      <div style={{ textAlign: 'center' }}>
        <Text className="bp3-text">Scan the QR code</Text>
        <Text className="bp3-text-muted">
          ( make sure your computer and device are connected on same WiFi )
        </Text>
      </div>
      <div>
        <Tooltip content="Click to make bigger" position={Position.LEFT}>
          <Button
            id="magnify-qr-code-button"
            className={classes.smallQRCode}
            onClick={() => setIsQRCodeMagnified(true)}
          >
            <QRCode
              value={`http://${LOCAL_LAN_IP}:${CLIENT_VIEWER_PORT}/${roomID}`}
              level="H"
              renderAs="svg"
              bgColor="rgba(0,0,0,0.0)"
              fgColor={isDarkTheme ? '#ffffff' : '#000000'}
              imageSettings={{
                // TODO: change image to app icon
                src:
                  'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Electron_Software_Framework_Logo.svg/256px-Electron_Software_Framework_Logo.svg.png',
                width: 40,
                height: 40,
              }}
            />
          </Button>
        </Tooltip>
      </div>
      <div style={{ marginBottom: '10px' }}>
        <Text className="bp3-text-muted">
          or type the following address manualy in browser address bar on any
          device:
        </Text>
      </div>

      <Tooltip content="Click to copy" position={Position.LEFT}>
        <Button
          intent="primary"
          icon="duplicate"
          style={{ borderRadius: '100px' }}
          onClick={() => {
            clipboard.writeText(
              `http://${LOCAL_LAN_IP}:${CLIENT_VIEWER_PORT}/${roomID}`
            );
          }}
        >
          {`http://${LOCAL_LAN_IP}:${CLIENT_VIEWER_PORT}/${roomID}`}
        </Button>
      </Tooltip>

      <Dialog
        // @ts-ignore
        id="bp3-qr-code-dialog-root"
        className={classes.bigQRCodeDialogRoot}
        isOpen={isQRCodeMagnified}
        onClose={() => setIsQRCodeMagnified(false)}
        canEscapeKeyClose
        canOutsideClickClose
        transitionDuration={isProduction() ? 700 : 0}
        style={{ position: 'relative', top: '-30px' }}
      >
        <Button
          id="qr-code-dialog-inner"
          onClick={() => setIsQRCodeMagnified(false)}
          style={{ paddingTop: '20px', paddingBottom: '13px' }}
        >
          <Row between="xs" middle="xs">
            <Col xs={10}>
              <H2 style={{ margin: '0px', padding: '0px', marginLeft: '35px' }}>
                Scan QR Code
              </H2>
            </Col>
            <Col xs={2}>
              <CloseOverlayButton
                onClick={() => setIsQRCodeMagnified(false)}
                style={{
                  width: '40px',
                  height: '40px',
                  position: 'relative',
                  borderRadius: '100px',
                }}
              />
            </Col>
          </Row>
          <Row center="xs">
            <div className={classes.dialogQRWrapper}>
              <QRCode
                value={`http://${LOCAL_LAN_IP}:${CLIENT_VIEWER_PORT}/${roomID}`}
                level="H"
                renderAs="svg"
                imageSettings={{
                  // TODO: change image to app icon
                  src:
                    'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Electron_Software_Framework_Logo.svg/256px-Electron_Software_Framework_Logo.svg.png',
                  width: 25,
                  height: 25,
                }}
                width="390px"
                height="390px"
              />
            </div>
          </Row>
        </Button>
      </Dialog>
    </>
  );
};

export default ScanQRStep;
