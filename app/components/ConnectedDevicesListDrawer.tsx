/* eslint-disable promise/always-return */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable react/destructuring-assignment */
import { ipcRenderer } from 'electron';
import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  Text,
  Position,
  Drawer,
  Card,
  Alert,
  H4,
} from '@blueprintjs/core';
import { Row, Col } from 'react-flexbox-grid';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import CloseOverlayButton from './CloseOverlayButton';
import DeviceInfoCallout from './DeviceInfoCallout';
import SharingSourcePreviewCard from './SharingSourcePreviewCard';
import isWithReactRevealAnimations from '../utils/isWithReactRevealAnimations';
import isProduction from '../utils/isProduction';
import { IpcEvents } from '../main/IpcEvents.enum';

type DeviceWithDesktopCapturerSourceId = Device & {
  desktopCapturerSourceId: string;
};

const ANIMATION_DURATION = 700;

const Fade = require('react-reveal/Fade');

interface ConnectedDevicesListDrawerProps {
  isOpen: boolean;
  handleToggle: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  stepperRef: any;
}

const useStyles = makeStyles(() =>
  createStyles({
    drawerRoot: { overflowY: 'scroll', overflowX: 'hidden' },
    drawerInnerTopPanel: { padding: '20px 10px 0px 30px' },
    connectedDevicesRoot: { padding: '10px 20px' },
    topHeader: {
      marginRight: '20px',
      fontSize: '20px',
      fontWeight: 900,
    },
    zoomFullWidth: {
      width: '100%',
    },
  })
);

export default function ConnectedDevicesListDrawer(
  props: ConnectedDevicesListDrawerProps
) {
  const { t } = useTranslation();
  const classes = useStyles();

  const [isAlertDisconectAllOpen, setIsAlertDisconectAllOpen] = useState(false);
  const [connectedDevices, setConnectedDevices] = useState<
    DeviceWithDesktopCapturerSourceId[]
  >([]);
  const [devicesDisplayed, setDevicesDisplayed] = useState(new Map());

  useEffect(() => {
    function getConnectedDevicesCallback() {
      ipcRenderer
        .invoke(IpcEvents.GetConnectedDevices)
        // eslint-disable-next-line promise/always-return
        .then(async (devices: Device[]) => {
          const devicesWithSourceIds: DeviceWithDesktopCapturerSourceId[] = [];
          // eslint-disable-next-line no-restricted-syntax
          for await (const device of devices) {
            const sharingSourceId = await ipcRenderer.invoke(
              IpcEvents.GetDesktopCapturerSourceIdBySharingSessionId,
              device.sharingSessionID
            );
            devicesWithSourceIds.push({
              ...device,
              desktopCapturerSourceId: sharingSourceId,
            });
          }
          setConnectedDevices(devicesWithSourceIds);

          const map = new Map();
          devicesWithSourceIds.forEach((el) => {
            map.set(el.id, true);
          });
          setDevicesDisplayed(map);
        })
        // eslint-disable-next-line no-console
        .catch((e) => console.error(e));
    }

    getConnectedDevicesCallback();

    const connectedDevicesInterval = setInterval(
      getConnectedDevicesCallback,
      4000
    );

    return () => {
      clearInterval(connectedDevicesInterval);
    };
  }, []);

  const handleDisconnectOneDevice = useCallback(
    async (id: string) => {
      const device = connectedDevices.find((d: Device) => d.id === id);
      if (!device) return;
      ipcRenderer.invoke(
        IpcEvents.DisconnectPeerAndDestroySharingSessionBySessionID,
        device.sharingSessionID
      );
    },
    [connectedDevices]
  );

  const handleDisconnectAll = useCallback(() => {
    connectedDevices.forEach((device: Device) => {
      ipcRenderer.invoke(
        IpcEvents.DisconnectPeerAndDestroySharingSessionBySessionID,
        device.sharingSessionID
      );
    });
    ipcRenderer.invoke(IpcEvents.DisconnectAllDevices);
  }, [connectedDevices]);

  const hideOneDeviceInDevicesDisplayed = useCallback(
    (id) => {
      const newDevicesDisplayed = new Map(devicesDisplayed);
      newDevicesDisplayed.set(id, false);
      setDevicesDisplayed(newDevicesDisplayed);
      setTimeout(() => {
        newDevicesDisplayed.delete(id);
        setDevicesDisplayed(newDevicesDisplayed);
        setConnectedDevices(
          connectedDevices.filter((device) => device.id !== id)
        );
      }, ANIMATION_DURATION);
    },
    [devicesDisplayed, setDevicesDisplayed]
  );

  const hideAllDevicesInDevicesDisplayed = useCallback(() => {
    const newDevicesDisplayed = new Map(devicesDisplayed);
    [...newDevicesDisplayed.keys()].forEach((key) => {
      newDevicesDisplayed.set(key, false);
    });
    setDevicesDisplayed(newDevicesDisplayed);
  }, [devicesDisplayed, setDevicesDisplayed]);

  const handleDisconnectAndHideOneDevice = useCallback(
    (id) => {
      setTimeout(
        async () => {
          handleDisconnectOneDevice(id);
          hideOneDeviceInDevicesDisplayed(id);
        },
        isProduction() ? ANIMATION_DURATION : 0
      );
    },
    [handleDisconnectOneDevice, hideOneDeviceInDevicesDisplayed]
  );

  const handleDisconnectAndHideAllDevices = useCallback(() => {
    hideAllDevicesInDevicesDisplayed();
    setTimeout(
      () => {
        handleDisconnectAll();
        props.handleToggle();
        props.stepperRef.current.handleReset();
      },
      isProduction() ? 1000 : 0
    );
  }, [handleDisconnectAll, hideAllDevicesInDevicesDisplayed, props]);

  const disconnectAllCancelButtonText = t('No, Cancel');
  const disconnectAllConfirmButtonText = t('Yes, Disconnect All');

  return (
    <>
      <Drawer
        className={classes.drawerRoot}
        position={Position.BOTTOM}
        size={Drawer.SIZE_LARGE}
        isOpen={props.isOpen}
        onClose={props.handleToggle}
        transitionDuration={
          isWithReactRevealAnimations() ? ANIMATION_DURATION : 0
        }
      >
        <Row between="xs" middle="xs" className={classes.drawerInnerTopPanel}>
          <Col xs={11}>
            <Row middle="xs">
              <div className={classes.topHeader}>
                <Text className="bp3-text-muted">{t('Connected Devices')}</Text>
              </div>
              <Button
                intent="danger"
                disabled={connectedDevices.length === 0}
                onClick={() => {
                  setIsAlertDisconectAllOpen(true);
                }}
                icon="disable"
                style={{
                  borderRadius: '100px',
                }}
              >
                {t('Disconnect all devices')}
              </Button>
            </Row>
          </Col>
          <Col xs={1}>
            <CloseOverlayButton onClick={props.handleToggle} isDefaultStyles />
          </Col>
        </Row>
        <Row className={classes.connectedDevicesRoot}>
          <Col xs={12}>
            <Fade
              bottom
              cascade
              duration={isWithReactRevealAnimations() ? ANIMATION_DURATION : 0}
            >
              <div className={classes.zoomFullWidth}>
                {connectedDevices.map((device) => {
                  return (
                    <div key={device.id}>
                      <Fade
                        collapse
                        opposite
                        when={devicesDisplayed.get(device.id)}
                        duration={isProduction() ? ANIMATION_DURATION : 0}
                      >
                        <Card className="connected-device-card">
                          <Row middle="xs">
                            <Col xs={6}>
                              <DeviceInfoCallout
                                deviceType={device.deviceType}
                                deviceOS={device.deviceOS}
                                deviceIP={device.deviceIP}
                                sharingSessionID={device.sharingSessionID}
                                deviceBrowser={device.deviceBrowser}
                              />
                            </Col>
                            <Col xs={6}>
                              <SharingSourcePreviewCard
                                sharingSourceID={device.desktopCapturerSourceId}
                              />
                            </Col>
                          </Row>
                          <Row center="xs">
                            <Button
                              id={`disconnect-device-${device.deviceIP}`}
                              intent="danger"
                              onClick={(): void => {
                                handleDisconnectAndHideOneDevice(device.id);
                              }}
                              icon="disable"
                              style={{
                                borderRadius: '100px',
                              }}
                            >
                              {t('Disconnect')}
                            </Button>
                          </Row>
                        </Card>
                      </Fade>
                    </div>
                  );
                })}
              </div>
            </Fade>
          </Col>
        </Row>
      </Drawer>
      <Alert
        isOpen={isAlertDisconectAllOpen}
        onClose={() => {
          setIsAlertDisconectAllOpen(false);
        }}
        icon="warning-sign"
        cancelButtonText={disconnectAllCancelButtonText}
        confirmButtonText={disconnectAllConfirmButtonText}
        intent="danger"
        canEscapeKeyCancel
        canOutsideClickCancel
        onCancel={() => {
          setIsAlertDisconectAllOpen(false);
        }}
        onConfirm={handleDisconnectAndHideAllDevices}
        transitionDuration={
          isWithReactRevealAnimations() ? ANIMATION_DURATION : 0
        }
      >
        <H4>
          {t(
            'Are you sure you want to disconnect all connected viewing devices?'
          )}
        </H4>
        <Text>{`${t('This step can not be undone')}.`}</Text>
        <Text>
          {`${t('You will have to connect all devices manually again')}.`}
        </Text>
      </Alert>
    </>
  );
}
