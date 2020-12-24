/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable react/destructuring-assignment */
import { remote } from 'electron';
import React, { useEffect, useState, useCallback } from 'react';

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
import ConnectedDevicesService from '../features/ConnectedDevicesService';
import SharingSessionsService from '../features/SharingSessionsService';
import DeviceInfoCallout from './DeviceInfoCallout';
import SharingSourcePreviewCard from './SharingSourcePreviewCard';
import isWithReactRevealAnimations from '../utils/isWithReactRevealAnimations';
import isProduction from '../utils/isProduction';

const sharingSessionsService = remote.getGlobal(
  'sharingSessionService'
) as SharingSessionsService;
const connectedDevicesService = remote.getGlobal(
  'connectedDevicesService'
) as ConnectedDevicesService;

const Fade = require('react-reveal/Fade');

const disconnectPeerAndDestroySharingSessionBySessionID = (
  sharingSessionID: string
) => {
  const sharingSession = sharingSessionsService.sharingSessions.get(
    sharingSessionID
  );
  sharingSession?.disconnectByHostMachineUser();
  sharingSession?.destory();
  sharingSessionsService.sharingSessions.delete(sharingSessionID);
};

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
  const classes = useStyles();

  const [isAlertDisconectAllOpen, setIsAlertDisconectAllOpen] = useState(false);

  const [devicesDisplayed, setDevicesDisplayed] = useState(new Map());

  useEffect(() => {
    const map = new Map();
    connectedDevicesService.getDevices().forEach((el) => {
      map.set(el.id, true);
    });
    setDevicesDisplayed(map);
  }, [setDevicesDisplayed]);

  const handleDisconnectOneDevice = useCallback(async (id: string) => {
    const device = connectedDevicesService.devices.find(
      (d: Device) => d.id === id
    );
    if (!device) return;
    disconnectPeerAndDestroySharingSessionBySessionID(device.sharingSessionID);
    connectedDevicesService.removeDeviceByID(id);
  }, []);

  const handleDisconnectAll = useCallback(() => {
    connectedDevicesService.devices.forEach((device: Device) => {
      disconnectPeerAndDestroySharingSessionBySessionID(
        device.sharingSessionID
      );
    });
    connectedDevicesService.removeAllDevices();
  }, []);

  const hideOneDeviceInDevicesDisplayed = useCallback(
    (id) => {
      const newDevicesDisplayed = new Map(devicesDisplayed);
      newDevicesDisplayed.set(id, false);
      setDevicesDisplayed(newDevicesDisplayed);
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
          await handleDisconnectOneDevice(id);
          hideOneDeviceInDevicesDisplayed(id);
        },
        isProduction() ? 1000 : 0
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

  return (
    <>
      <Drawer
        className={classes.drawerRoot}
        position={Position.BOTTOM}
        size={Drawer.SIZE_LARGE}
        isOpen={props.isOpen}
        onClose={props.handleToggle}
        transitionDuration={isWithReactRevealAnimations() ? 700 : 0}
        // transitionDuration={0}
      >
        <Row between="xs" middle="xs" className={classes.drawerInnerTopPanel}>
          <Col xs={11}>
            <Row middle="xs">
              <div className={classes.topHeader}>
                <Text className="bp3-text-muted">Connected Devices</Text>
              </div>
              <Button
                intent="danger"
                disabled={connectedDevicesService.getDevices().length === 0}
                onClick={() => {
                  setIsAlertDisconectAllOpen(true);
                }}
                icon="disable"
              >
                Disconnect all devices
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
              duration={isWithReactRevealAnimations() ? 700 : 0}
            >
              <div className={classes.zoomFullWidth}>
                {connectedDevicesService.getDevices().map((device) => {
                  return (
                    <div key={device.id}>
                      <Fade
                        collapse
                        opposite
                        when={devicesDisplayed.get(device.id)}
                        duration={isProduction() ? 700 : 0}
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
                                sharingSourceID={
                                  sharingSessionsService.sharingSessions.get(
                                    device.sharingSessionID
                                  )?.desktopCapturerSourceID
                                }
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
                            >
                              Disconnect
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
        cancelButtonText="No, Cancel"
        confirmButtonText="Yes, Disconnect All"
        intent="danger"
        canEscapeKeyCancel
        canOutsideClickCancel
        onCancel={() => {
          setIsAlertDisconectAllOpen(false);
        }}
        onConfirm={handleDisconnectAndHideAllDevices}
        transitionDuration={isWithReactRevealAnimations() ? 700 : 0}
      >
        <H4>
          Are you sure you want to disconnect all connected viewing devices?
        </H4>
        <Text>This step can not be reverted.</Text>
        <Text>You will have to connect all devices manually again.</Text>
      </Alert>
    </>
  );
}
