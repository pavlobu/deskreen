/* eslint-disable @typescript-eslint/ban-ts-comment */
import { clipboard, ipcRenderer } from 'electron';
import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  Text,
  Tooltip,
  Position,
  Dialog,
  Classes,
} from '@blueprintjs/core';
import QRCode from 'qrcode.react';
import { makeStyles, createStyles } from '@material-ui/core';
import { Row, Col } from 'react-flexbox-grid';
import { SettingsContext } from '../../containers/SettingsProvider';
import isProduction from '../../utils/isProduction';
import config from '../../api/config';
import { IpcEvents } from '../../main/IpcEvents.enum';

const { port } = config;

// TODO: change port to user defined port, if it is really defined
const CLIENT_VIEWER_PORT = isProduction() ? port : '3000';

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
      paddingBottom: '0px',
    },
  })
);

const ScanQRStep: React.FC = () => {
  const { t } = useTranslation();
  const classes = useStyles();
  const { isDarkTheme } = useContext(SettingsContext);

  const [roomID, setRoomID] = useState('');
  const [LOCAL_LAN_IP, setLocalLanIP] = useState('');

  useEffect(() => {
    const getRoomIdInterval = setInterval(async () => {
      const roomId = await ipcRenderer.invoke(
        IpcEvents.GetWaitingForConnectionSharingSessionRoomId
      );
      if (roomId) {
        setRoomID(roomId);
      }
    }, 1000);

    const ipInterval = setInterval(async () => {
      const gotIP = await ipcRenderer.invoke('get-local-lan-ip');
      if (gotIP) {
        setLocalLanIP(gotIP);
      }
    }, 1000);

    return () => {
      clearInterval(getRoomIdInterval);
      clearInterval(ipInterval);
    };
  }, []);

  const [isQRCodeMagnified, setIsQRCodeMagnified] = useState(false);

  return (
    <>
      <div style={{ textAlign: 'center' }}>
        <Text>
          <span
            style={{
              backgroundColor: '#00f99273',
              fontWeight: 900,
              paddingRight: '8px',
              paddingLeft: '8px',
              borderRadius: '20px',
            }}
          >
            {t(
              'Make sure your computer and screen viewing device are connected to same Wi-Fi'
            )}
          </span>
        </Text>
        <Text className="bp3-text">{t('Scan the QR code')}</Text>
      </div>
      <div>
        <Tooltip content={t('Click to make bigger')} position={Position.LEFT}>
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
                src: `http://127.0.0.1:${CLIENT_VIEWER_PORT}/logo192.png`,
                width: 40,
                height: 40,
              }}
            />
          </Button>
        </Tooltip>
      </div>
      <div style={{ marginBottom: '10px' }}>
        <Text className="bp3-text-muted">
          {`${t(
            'Or type the following address in browser address bar on any device'
          )}:`}
        </Text>
      </div>

      <Tooltip content={t('Click to copy')} position={Position.LEFT}>
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
        style={{ position: 'relative', top: '0px' }}
        usePortal={false}
      >
        <Row
          id="qr-code-dialog-inner"
          className={Classes.DIALOG_BODY}
          center="xs"
          middle="xs"
          onClick={() => setIsQRCodeMagnified(false)}
        >
          <Col xs={11} className={classes.dialogQRWrapper}>
            <QRCode
              value={`http://${LOCAL_LAN_IP}:${CLIENT_VIEWER_PORT}/${roomID}`}
              level="H"
              renderAs="svg"
              imageSettings={{
                // TODO: change image to app icon
                src: `http://127.0.0.1:${CLIENT_VIEWER_PORT}/logo192.png`,
                width: 25,
                height: 25,
              }}
              width="390px"
              height="390px"
            />
          </Col>
        </Row>
      </Dialog>
    </>
  );
};

export default ScanQRStep;
