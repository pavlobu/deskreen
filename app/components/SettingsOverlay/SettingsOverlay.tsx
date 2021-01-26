/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { ipcRenderer, remote, shell } from 'electron';
import React, { useContext, useCallback, useEffect, useState } from 'react';
import {
  Button,
  Overlay,
  Classes,
  H3,
  H6,
  H4,
  Tabs,
  Tab,
  Icon,
  HTMLSelect,
  Text,
  ControlGroup,
  Checkbox,
} from '@blueprintjs/core';
import { useTranslation } from 'react-i18next';
import { Col, Row } from 'react-flexbox-grid';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import i18n from 'i18next';
import SharingSessionService from '../../features/SharingSessionService';
import {
  DARK_UI_BACKGROUND,
  LIGHT_UI_BACKGROUND,
  SettingsContext,
} from '../../containers/SettingsProvider';
import CloseOverlayButton from '../CloseOverlayButton';
import i18n_client, {
  getLangFullNameToLangISOKeyMap,
  getLangISOKeyToLangFullNameMap,
} from '../../configs/i18next.config.client';
import SettingRowLabelAndInput from './SettingRowLabelAndInput';
import isWithReactRevealAnimations from '../../utils/isWithReactRevealAnimations';
import config from '../../api/config';

const { port } = config;

const Fade = require('react-reveal/Fade');

const sharingSessionService = remote.getGlobal(
  'sharingSessionService'
) as SharingSessionService;

interface SettingsOverlayProps {
  isSettingsOpen: boolean;
  handleClose: () => void;
}

const useStylesWithTheme = (isDarkTheme: boolean) =>
  makeStyles(() =>
    createStyles({
      checkboxSettings: { margin: '0' },
      overlayInnerRoot: { width: '90%' },
      overlayInsideFade: {
        height: '90vh',
        backgroundColor: isDarkTheme ? DARK_UI_BACKGROUND : LIGHT_UI_BACKGROUND,
      },
      absoluteCloseButton: { position: 'absolute', left: 'calc(100% - 65px)' },
      tabNavigationRowButton: { fontWeight: 700 },
      iconInTablLeftButton: { marginRight: '5px' },
    })
  );

export default function SettingsOverlay(props: SettingsOverlayProps) {
  const { t } = useTranslation();

  const { handleClose, isSettingsOpen } = props;

  const [latestVersion, setLatestVersion] = useState('');
  const [currentVersion, setCurrentVersion] = useState('');

  const {
    isDarkTheme,
    setIsDarkThemeHook,
    setCurrentLanguageHook,
  } = useContext(SettingsContext);

  const [languagesList, setLanguagesList] = useState([] as string[]);

  useEffect(() => {
    const getLatestVersion = async () => {
      const gotLatestVersion = await ipcRenderer.invoke('get-latest-version');
      if (gotLatestVersion !== '') {
        setLatestVersion(gotLatestVersion);
      }
    };
    getLatestVersion();
    const getCurrentVersion = async () => {
      const gotCurrentVersion = await ipcRenderer.invoke('get-current-version');
      if (gotCurrentVersion !== '') {
        setCurrentVersion(gotCurrentVersion);
      }
    };
    getCurrentVersion();
  }, []);

  useEffect(() => {
    const tmp: string[] = [];
    getLangFullNameToLangISOKeyMap().forEach((_, key) => {
      tmp.push(key);
    });
    setLanguagesList(tmp);
    setCurrentLanguageHook(i18n_client.language);
  }, [setCurrentLanguageHook]);

  const getClassesCallback = useStylesWithTheme(isDarkTheme);

  const handleToggleDarkTheme = useCallback(() => {
    if (!isDarkTheme) {
      document.body.classList.toggle(Classes.DARK);
      setIsDarkThemeHook(true);
    }
    // TODO: call sharing sessions service here to notify all connected clients about theme change
    sharingSessionService.sharingSessions.forEach((sharingSession) => {
      sharingSession?.appThemeChanged(true);
    });
    sharingSessionService.setAppTheme(true);
  }, [isDarkTheme, setIsDarkThemeHook]);

  const handleToggleLightTheme = useCallback(() => {
    if (isDarkTheme) {
      document.body.classList.toggle(Classes.DARK);
      setIsDarkThemeHook(false);
    }
    // TODO: call sharing sessions service here to notify all connected clients about theme change
    sharingSessionService.sharingSessions.forEach((sharingSession) => {
      sharingSession?.appThemeChanged(false);
    });
    sharingSessionService.setAppTheme(false);
  }, [isDarkTheme, setIsDarkThemeHook]);

  const onChangeLangueageHTMLSelectHandler = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    if (
      event.currentTarget &&
      getLangFullNameToLangISOKeyMap().has(event.currentTarget.value)
    ) {
      const newLang =
        getLangFullNameToLangISOKeyMap().get(event.currentTarget.value) ||
        'English';
      i18n.changeLanguage(newLang);
      // TODO: call sharing sessions service here to notify all connected clients about language change
      sharingSessionService.sharingSessions.forEach((sharingSession) => {
        sharingSession?.appLanguageChanged(newLang);
      });
      sharingSessionService.setAppLanguage(newLang);
    }
  };

  const getThemeChangingControlGroupInput = () => {
    return (
      <ControlGroup fill vertical={false}>
        <Button
          icon="flash"
          text="Light"
          onClick={handleToggleLightTheme}
          active={!isDarkTheme}
        />
        <Button
          icon="moon"
          text="Dark"
          onClick={handleToggleDarkTheme}
          active={isDarkTheme}
        />
      </ControlGroup>
    );
  };

  const getLanguageChangingHTMLSelect = () => {
    return (
      <HTMLSelect
        disabled // TODO: remove when tranlations are ready
        defaultValue={getLangISOKeyToLangFullNameMap().get(i18n.language)}
        options={languagesList}
        onChange={onChangeLangueageHTMLSelectHandler}
      />
    );
  };

  const getAutomaticUpdatesCheckboxInput = () => {
    return (
      <Checkbox
        disabled
        className={getClassesCallback().checkboxSettings}
        label="Disabled"
      />
    );
  };

  const GeneralSettingsPanel: React.FC = () => (
    <>
      <Row middle="xs">
        <H3 className="bp3-text-muted">General Settings</H3>
      </Row>
      <SettingRowLabelAndInput
        icon="style"
        label="Colors"
        input={getThemeChangingControlGroupInput()}
      />
      <SettingRowLabelAndInput
        icon="translate"
        label={t('Language')}
        input={getLanguageChangingHTMLSelect()}
      />
      <SettingRowLabelAndInput
        icon="automatic-updates"
        label="Automatic Updates"
        input={getAutomaticUpdatesCheckboxInput()}
      />
    </>
  );

  const SecurityPanel: React.FC = () => (
    <div>
      <H3>
        <Icon icon="shield" iconSize={20} />
        Security
      </H3>
      <H6 className={Classes.RUNNING_TEXT}>
        {`HTML is great for declaring static documents, but it falters when we try
        to use it for declaring dynamic views in web-applications. AngularJS
        lets you extend HTML vocabulary for your application. The resulting
        environment is extraordinarily expressive, readable, and quick to
        develop.`}
      </H6>
    </div>
  );

  const BlockedIPsPanel: React.FC = () => (
    <div>
      <H3>Blocked IPs</H3>
    </div>
  );

  const AboutPanel: React.FC = () => (
    <Row center="xs" middle="xs" style={{ height: 'calc(100vh - 40%)' }}>
      <div>
        <Col xs={12}>
          <img
            src={`http://127.0.0.1:${port}/logo512.png`}
            alt="logo"
            style={{ width: '100px' }}
          />
        </Col>
        <Col xs={12}>
          <H3>About Deskreen</H3>
        </Col>
        <Col xs={12}>
          <Text>{`Version: ${currentVersion} (${currentVersion})`}</Text>
        </Col>
        <Col xs={12}>
          <Text>
            {`Copyright © ${new Date().getFullYear()} `}
            <a
              onClick={() => {
                shell.openExternal('https://linkedin.com/in/pavlobu');
              }}
              style={
                isDarkTheme
                  ? {}
                  : {
                      color: 'blue',
                    }
              }
            >
              Pavlo (Paul) Buidenkov
            </a>
          </Text>
        </Col>
        <Col xs={12}>
          <Text>
            {`Website: `}
            <a
              onClick={() => {
                shell.openExternal('https://www.deskreen.com');
              }}
              style={
                isDarkTheme
                  ? {}
                  : {
                      color: 'blue',
                    }
              }
            >
              https://www.deskreen.com
            </a>
          </Text>
        </Col>
      </div>
    </Row>
  );

  const getTabNavBlockedIPsButton = () => {
    return (
      <Row middle="xs" className={getClassesCallback().tabNavigationRowButton}>
        <Icon
          icon="blocked-person"
          className={getClassesCallback().iconInTablLeftButton}
        />
        <Text className="bp3-text-large">Blacklisted IPs</Text>
      </Row>
    );
  };

  const getTabNavSecurityButton = () => {
    return (
      <Row middle="xs" className={getClassesCallback().tabNavigationRowButton}>
        <Icon
          icon="shield"
          className={getClassesCallback().iconInTablLeftButton}
        />
        <Text className="bp3-text-large">Security</Text>
      </Row>
    );
  };

  const getTabNavGeneralSettingsButton = () => {
    return (
      <Row middle="xs" className={getClassesCallback().tabNavigationRowButton}>
        <Icon
          icon="wrench"
          className={getClassesCallback().iconInTablLeftButton}
        />
        <Text className="bp3-text-large">General</Text>
      </Row>
    );
  };

  const getTabNavAboutButton = () => {
    return (
      <Row middle="xs" className={getClassesCallback().tabNavigationRowButton}>
        <Icon
          icon="info-sign"
          className={getClassesCallback().iconInTablLeftButton}
        />
        <Text className="bp3-text-large">About</Text>
      </Row>
    );
  };

  return (
    <Overlay
      onClose={handleClose}
      className={`${Classes.OVERLAY_SCROLL_CONTAINER} bp3-overlay-settings`}
      autoFocus
      canEscapeKeyClose
      canOutsideClickClose
      enforceFocus
      hasBackdrop
      isOpen={isSettingsOpen}
      usePortal
      transitionDuration={0}
    >
      <div className={getClassesCallback().overlayInnerRoot}>
        <Fade duration={isWithReactRevealAnimations() ? 700 : 0}>
          <div
            id="settings-overlay-inner"
            className={`${getClassesCallback().overlayInsideFade} ${
              Classes.CARD
            }`}
          >
            <CloseOverlayButton
              className={getClassesCallback().absoluteCloseButton}
              onClick={handleClose}
              isDefaultStyles
            />
            {latestVersion !== '' &&
            currentVersion !== '' &&
            latestVersion !== currentVersion ? (
              <H4
                id="new-version-header"
                onClick={(e) => {
                  e.preventDefault();
                  shell.openExternal(
                    'https://github.com/pavlobu/deskreen/releases/latest'
                  );
                }}
              >
                {/* eslint-disable-next-line react/jsx-one-expression-per-line */}
                New version {latestVersion} is available! Click to download.
              </H4>
            ) : (
              <></>
            )}
            <Tabs
              animate
              id="TabsExample"
              key="vertical"
              renderActiveTabPanelOnly
              vertical
            >
              <Tab id="rx" title="" panel={<GeneralSettingsPanel />}>
                {getTabNavGeneralSettingsButton()}
              </Tab>
              <Tab id="ng" disabled title="" panel={<SecurityPanel />}>
                {getTabNavSecurityButton()}
              </Tab>
              <Tab id="bb" disabled title="" panel={<BlockedIPsPanel />}>
                {getTabNavBlockedIPsButton()}
              </Tab>
              <Tab id="cc" title="" panel={<AboutPanel />}>
                {getTabNavAboutButton()}
              </Tab>
              <Tabs.Expander />
            </Tabs>
          </div>
        </Fade>
      </div>
    </Overlay>
  );
}
