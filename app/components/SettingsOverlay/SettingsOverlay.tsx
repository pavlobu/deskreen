/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react/destructuring-assignment */
import React, {
  useContext,
  useCallback,
  useMemo,
  useEffect,
  useState,
} from 'react';
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
import {
  DARK_UI_BACKGROUND,
  LIGHT_UI_BACKGROUND,
  SettingsContext,
} from '../../containers/SettingsProvider';
import CloseOverlayButton from '../CloseOverlayButton';
import { getLangNameToLangKeyMap } from '../../configs/i18next.config.client';
import config from '../../configs/app.lang.config';
import isProduction from '../../utils/isProduction';
import SettingRowLabelAndInput from './SettingRowLabelAndInput';

const Fade = require('react-reveal/Fade');

interface SettingsOverlayProps {
  isSettingsOpen: boolean;
  handleClose: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const useStylesWithTheme = (_isDarkTheme: boolean) =>
  makeStyles(() =>
    createStyles({
      checkboxSettings: { margin: '0' },
      overlayInnerRoot: { width: '90%' },
      overlayInsideFade: {
        height: '90vh',
        backgroundColor: _isDarkTheme
          ? DARK_UI_BACKGROUND
          : LIGHT_UI_BACKGROUND,
      },
      absoluteCloseButton: { position: 'absolute', left: 'calc(100% - 65px)' },
      tabNavigationRowButton: { fontWeight: 700 },
      iconInTablLeftButton: { marginRight: '5px' },
    })
  );

export default function SettingsOverlay(props: SettingsOverlayProps) {
  const { t } = useTranslation();

  const { isDarkTheme, setIsDarkThemeHook } = useContext(SettingsContext);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const [languagesList, setLanguagesList] = useState([] as string[]);

  const LANG_NAME_TO_KEY_MAP = useMemo(() => {
    return getLangNameToLangKeyMap();
  }, []);

  useEffect(() => {
    const tmp: string[] = [];
    // eslint-disable-next-line no-restricted-syntax
    for (const [key] of Object.entries(LANG_NAME_TO_KEY_MAP)) {
      // @ts-ignore: fine here
      tmp.push(key);
    }
    setLanguagesList(tmp);
  }, [LANG_NAME_TO_KEY_MAP]);

  const getClassesCallback = useCallback(() => {
    return useStylesWithTheme(isDarkTheme)();
  }, [isDarkTheme]);

  const handleToggleDarkTheme = useCallback(() => {
    if (!isDarkTheme) {
      document.body.classList.toggle(Classes.DARK);
      setIsDarkThemeHook(true);
    }
  }, [isDarkTheme, setIsDarkThemeHook]);

  const handleToggleLightTheme = useCallback(() => {
    if (isDarkTheme) {
      document.body.classList.toggle(Classes.DARK);
      setIsDarkThemeHook(false);
    }
  }, [isDarkTheme, setIsDarkThemeHook]);

  const onChangeLangueageHTMLSelectHandler = (event: any) => {
    if (
      event.currentTarget &&
      event.currentTarget.value in LANG_NAME_TO_KEY_MAP
    ) {
      // @ts-ignore: fine here
      i18n.changeLanguage(LANG_NAME_TO_KEY_MAP[event.currentTarget.value]);
    }
  };

  const GeneralSettingsPanel: React.FC = () => (
    <>
      <Row middle="xs">
        <H3 className="bp3-text-muted">General Settings</H3>
      </Row>
      <SettingRowLabelAndInput
        icon="style"
        label="Colors"
        input={
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
        }
      />
      <SettingRowLabelAndInput
        icon="translate"
        label={t('Language')}
        input={
          <HTMLSelect
            defaultValue={
              // @ts-ignore: fine here
              config.langISOKeyToLangFullNameMap[i18n.language]
            }
            options={languagesList}
            onChange={onChangeLangueageHTMLSelectHandler}
          />
        }
      />
      <SettingRowLabelAndInput
        icon="automatic-updates"
        label="Automatic Updates"
        input={
          <Checkbox
            checked
            className={getClassesCallback().checkboxSettings}
            label="Enabled"
          />
        }
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
      onClose={props.handleClose}
      className={`${Classes.OVERLAY_SCROLL_CONTAINER} bp3-overlay-settings`}
      autoFocus
      canEscapeKeyClose
      canOutsideClickClose
      enforceFocus
      hasBackdrop
      isOpen={props.isSettingsOpen}
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
              onClick={props.handleClose}
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
