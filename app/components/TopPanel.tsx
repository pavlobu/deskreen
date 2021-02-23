/* eslint-disable react/destructuring-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/rules-of-hooks */
import { shell } from 'electron';
import React, { useCallback, useContext } from 'react';
import { Button, Text, Icon, Position, Tooltip } from '@blueprintjs/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { Col, Row } from 'react-flexbox-grid';
import { useTranslation } from 'react-i18next';
import SettingsOverlay from './SettingsOverlay/SettingsOverlay';
import ConnectedDevicesListDrawer from './ConnectedDevicesListDrawer';
import { SettingsContext } from '../containers/SettingsProvider';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore fine import here
import RedHeartTwemojiPNG from '../images/red_heart_2764_twemoji_120x120.png';

const useStylesWithTheme = (isDarkTheme: boolean) =>
  makeStyles(() =>
    createStyles({
      topPanelRoot: {
        display: 'flex',
        paddingTop: '15px',
        marginBottom: '20px',
      },
      logoWithAppName: { margin: '0 auto' },
      appNameHeader: {
        margin: '0 auto',
        paddingTop: '5px',
        fontFamily: 'Lexend Peta',
        fontSize: '20px',
        color: isDarkTheme ? '#48AFF0' : '#1F4B99',
        cursor: 'default !important',
      },
      topPanelControlButtonsRoot: {
        position: 'absolute',
        right: '15px',
        display: 'flex',
      },
      topPanelControlButton: {
        width: '40px',
        height: '40px',
        borderRadius: '50px',
        cursor: 'default !important',
      },
      topPanelControlButtonMargin: {
        marginRight: '20px',
        cursor: 'default !important',
      },
      topPanelIconOfControlButton: {
        cursor: 'default !important',
      },
    })
  );

export default function TopPanel(props: any) {
  const { t } = useTranslation();
  const { isDarkTheme } = useContext(SettingsContext);

  const getClassesCallback = useCallback(() => {
    return useStylesWithTheme(isDarkTheme)();
  }, [isDarkTheme]);

  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
  const [isDrawersOpen, setIsDrawerOpen] = React.useState(false);

  const handleSettingsOpen = useCallback(() => {
    setIsSettingsOpen(true);
  }, []);

  const handleSettingsClose = useCallback(() => {
    setIsSettingsOpen(false);
  }, []);

  const handleToggleConnectedDevicesListDrawer = useCallback(() => {
    setIsDrawerOpen(!isDrawersOpen);
  }, [isDrawersOpen]);

  const donateTooltipContent = t(
    'If you like Deskreen consider contributing financially Deskreen is open-source Your donations keep us motivated to make Deskreen even better'
  );
  const deskreenButtonTooltip = t('Click to visit our website');

  const renderDonateButton = useCallback(() => {
    return (
      <Tooltip content={donateTooltipContent} position={Position.BOTTOM}>
        <Button
          style={{
            marginRight: '10px',
            borderRadius: '100px',
          }}
          onClick={() => {
            shell.openExternal('https://www.patreon.com/deskreen');
          }}
        >
          <Row start="xs">
            <Col xs>
              <img
                src={RedHeartTwemojiPNG}
                width={16}
                height={16}
                style={{ transform: 'translateY(2px)' }}
                alt="heart"
              />
            </Col>
            <Col xs>
              <div
                style={{
                  transform: 'translateY(2px) translateX(-5px)',
                  width: 'max-content',
                }}
              >
                <Text>{t('Donate')}</Text>
              </div>
            </Col>
          </Row>
        </Button>
      </Tooltip>
    );
  }, [donateTooltipContent, t]);

  const renderConnectedDevicesListButton = useCallback(() => {
    return (
      <div className={getClassesCallback().topPanelControlButtonMargin}>
        <Tooltip content={t('Connected Devices')} position={Position.BOTTOM}>
          <Button
            id="top-panel-connected-devices-list-button"
            intent="primary"
            className={getClassesCallback().topPanelControlButton}
            onClick={handleToggleConnectedDevicesListDrawer}
          >
            <Icon
              className={getClassesCallback().topPanelIconOfControlButton}
              icon="th-list"
              iconSize={20}
            />
          </Button>
        </Tooltip>
      </div>
    );
  }, [getClassesCallback, handleToggleConnectedDevicesListDrawer, t]);

  const renderHelpButton = useCallback(() => {
    return (
      <div className={getClassesCallback().topPanelControlButtonMargin}>
        <Tooltip content={t('Tutorial')} position={Position.BOTTOM}>
          <Button
            id="top-panel-help-button"
            intent="none"
            className={getClassesCallback().topPanelControlButton}
            onClick={() => {
              shell.openExternal('https://www.deskreen.com/?#howtos');
            }}
          >
            <Icon
              className={getClassesCallback().topPanelIconOfControlButton}
              icon="learning"
              iconSize={22}
            />
          </Button>
        </Tooltip>
      </div>
    );
  }, [getClassesCallback, t]);

  const renderSettingsButton = useCallback(() => {
    return (
      <div className={getClassesCallback().topPanelControlButtonMargin}>
        <Tooltip content={t('Settings')} position={Position.BOTTOM}>
          <Button
            id="top-panel-settings-button"
            onClick={handleSettingsOpen}
            className={getClassesCallback().topPanelControlButton}
          >
            <Icon
              className={getClassesCallback().topPanelIconOfControlButton}
              icon="cog"
              iconSize={22}
            />
          </Button>
        </Tooltip>
      </div>
    );
  }, [getClassesCallback, handleSettingsOpen, t]);

  const renderLogoWithAppName = useCallback(() => {
    return (
      <div
        id="logo-with-popover-visit-website"
        className={getClassesCallback().logoWithAppName}
      >
        <Tooltip content={deskreenButtonTooltip} position={Position.BOTTOM}>
          <Button
            minimal
            onClick={() => {
              shell.openExternal('https://www.deskreen.com');
            }}
            style={{
              borderRadius: '100px',
            }}
          >
            <h4
              id="deskreen-top-app-name-header"
              className={getClassesCallback().appNameHeader}
              style={{
                transform: 'translateY(-3px)',
              }}
            >
              Deskreen
            </h4>
          </Button>
        </Tooltip>
      </div>
    );
  }, [deskreenButtonTooltip, getClassesCallback]);

  return (
    <>
      <div className={getClassesCallback().topPanelRoot}>
        <Row
          middle="xs"
          center="xs"
          style={{ width: '100%', transform: 'translateX(-50px)' }}
        >
          <Col>{renderDonateButton()}</Col>
          <Col>{renderLogoWithAppName()}</Col>
        </Row>
        <div className={getClassesCallback().topPanelControlButtonsRoot}>
          {renderConnectedDevicesListButton()}
          {renderHelpButton()}
          {renderSettingsButton()}
        </div>
      </div>
      <SettingsOverlay
        isSettingsOpen={isSettingsOpen}
        handleClose={handleSettingsClose}
      />
      <ConnectedDevicesListDrawer
        isOpen={isDrawersOpen}
        handleToggle={handleToggleConnectedDevicesListDrawer}
        stepperRef={props.stepperRef}
      />
    </>
  );
}
