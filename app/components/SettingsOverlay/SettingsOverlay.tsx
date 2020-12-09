import { remote } from 'electron';
import React, { useContext, useCallback, useEffect, useState } from 'react';
import {
  Button,
  Overlay,
  Classes,
  H3,
  H6,
  Tabs,
  Tab,
  Icon,
  HTMLSelect,
  Text,
  ControlGroup,
  Checkbox,
} from '@blueprintjs/core';
import { useTranslation } from 'react-i18next';
import { Row } from 'react-flexbox-grid';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import i18n from 'i18next';
import SharingSessionsService from '../../features/SharingSessionsService';
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
import isProduction from '../../utils/isProduction';
import SettingRowLabelAndInput from './SettingRowLabelAndInput';

const Fade = require('react-reveal/Fade');

const sharingSessionsService = remote.getGlobal(
  'sharingSessionService'
) as SharingSessionsService;

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

  const {
    isDarkTheme,
    setIsDarkThemeHook,
    setCurrentLanguageHook,
  } = useContext(SettingsContext);

  const [languagesList, setLanguagesList] = useState([] as string[]);

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
    sharingSessionsService.sharingSessions.forEach((sharingSession) => {
      sharingSession?.appThemeChanged(true);
    });
    sharingSessionsService.setAppTheme(true);
  }, [isDarkTheme, setIsDarkThemeHook]);

  const handleToggleLightTheme = useCallback(() => {
    if (isDarkTheme) {
      document.body.classList.toggle(Classes.DARK);
      setIsDarkThemeHook(false);
    }
    // TODO: call sharing sessions service here to notify all connected clients about theme change
    sharingSessionsService.sharingSessions.forEach((sharingSession) => {
      sharingSession?.appThemeChanged(false);
    });
    sharingSessionsService.setAppTheme(false);
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
      sharingSessionsService.sharingSessions.forEach((sharingSession) => {
        sharingSession?.appLanguageChanged(newLang);
      });
      sharingSessionsService.setAppLanguage(newLang);
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
        defaultValue={getLangISOKeyToLangFullNameMap().get(i18n.language)}
        options={languagesList}
        onChange={onChangeLangueageHTMLSelectHandler}
      />
    );
  };

  const getAutomaticUpdatesCheckboxInput = () => {
    return (
      <Checkbox
        checked
        className={getClassesCallback().checkboxSettings}
        label="Enabled"
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

  const getTabNavBlockedIPsButton = () => {
    return (
      <Row middle="xs" className={getClassesCallback().tabNavigationRowButton}>
        <Icon
          icon="blocked-person"
          className={getClassesCallback().iconInTablLeftButton}
        />
        <Text className="bp3-text-large">Blackilsted IPs</Text>
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
        <Fade duration={isProduction() ? 700 : 0}>
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
              <Tab id="ng" title="" panel={<SecurityPanel />}>
                {getTabNavSecurityButton()}
              </Tab>
              <Tab id="bb" disabled title="" panel={<BlockedIPsPanel />}>
                {getTabNavBlockedIPsButton()}
              </Tab>
              <Tabs.Expander />
            </Tabs>
          </div>
        </Fade>
      </div>
    </Overlay>
  );
}
