/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable react/destructuring-assignment */
import React, { useContext, useEffect, useState, useCallback } from 'react';

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
import { ConnectedDevicesContext } from '../containers/ConnectedDevicesProvider';
import isProduction from '../utils/isProduction';

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
  const classes = useStyles();

  const [isAlertDisconectAllOpen, setIsAlertDisconectAllOpen] = useState(false);

  const { devices, setDevicesHook } = useContext(ConnectedDevicesContext);
  const [devicesDisplayed, setDevicesDisplayed] = useState(new Map());

  useEffect(() => {
    const map = new Map();
    devices.forEach((el) => {
      map.set(el.id, true);
    });
    setDevicesDisplayed(map);
  }, [devices, setDevicesDisplayed]);

  const handleDisconnectOneDevice = useCallback(
    (id: string) => {
      const filteredDevices = devices.filter((device) => {
        return device.id !== id;
      });

      setDevicesHook(filteredDevices);
    },
    [devices, setDevicesHook]
  );

  const handleDisconnectAll = useCallback(() => {
    setDevicesHook([] as Device[]);
  }, [setDevicesHook]);

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
      hideOneDeviceInDevicesDisplayed(id);
      setTimeout(
        () => {
          handleDisconnectOneDevice(id);
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
        transitionDuration={isProduction() ? 700 : 0}
      >
        <Row between="xs" middle="xs" className={classes.drawerInnerTopPanel}>
          <Col xs={11}>
            <Row middle="xs">
              <div className={classes.topHeader}>
                <Text className="bp3-text-muted">Connected Devices</Text>
              </div>
              <Button
                intent="danger"
                disabled={devices.length === 0}
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
            <CloseOverlayButton onClick={props.handleToggle} />
          </Col>
        </Row>
        <Row className={classes.connectedDevicesRoot}>
          <Col xs={12}>
            <Fade bottom cascade duration={isProduction() ? 700 : 0}>
              <div className={classes.zoomFullWidth}>
                {devices.map((device) => {
                  return (
                    <div key={device.id}>
                      <Fade
                        collapse
                        opposite
                        /* @ts-ignore: fine here */
                        when={devicesDisplayed.get(device.id)}
                        duration={isProduction() ? 700 : 0}
                      >
                        <Card>
                          <Text className="device-ip-container">
                            {device.deviceIP}
                          </Text>
                          <Text>{device.deviceType}</Text>
                          <Text>{device.deviceOS}</Text>
                          <Text>{device.sharingSessionID}</Text>
                          <Button
                            intent="danger"
                            onClick={(): void => {
                              handleDisconnectAndHideOneDevice(device.id);
                            }}
                            icon="disable"
                          >
                            Disconnect
                          </Button>
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
        transitionDuration={isProduction() ? 700 : 0}
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
