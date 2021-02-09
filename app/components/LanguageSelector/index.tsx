import React, { useContext, useEffect, useState } from 'react';
import { remote } from 'electron';
import { HTMLSelect } from '@blueprintjs/core';
import i18n from 'i18next';
import SharingSessionService from '../../features/SharingSessionService';
import { SettingsContext } from '../../containers/SettingsProvider';
import i18n_client, {
  getLangFullNameToLangISOKeyMap,
  getLangISOKeyToLangFullNameMap,
} from '../../configs/i18next.config.client';

const sharingSessionService = remote.getGlobal(
  'sharingSessionService'
) as SharingSessionService;

export default function LanguageSelector() {
  const { setCurrentLanguageHook } = useContext(SettingsContext);

  const [languagesList, setLanguagesList] = useState([] as string[]);

  useEffect(() => {
    const tmp: string[] = [];
    getLangFullNameToLangISOKeyMap().forEach((_, key) => {
      tmp.push(key);
    });
    setLanguagesList(tmp);
    setCurrentLanguageHook(i18n_client.language);
  }, [setCurrentLanguageHook]);

  const onChangeLanguageHTMLSelectHandler = (
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
        sharingSession?.appLanguageChanged();
      });
    }
  };

  return (
    <HTMLSelect
      value={getLangISOKeyToLangFullNameMap().get(i18n.language)}
      options={languagesList}
      onChange={onChangeLanguageHTMLSelectHandler}
      style={{
        borderRadius: '50px',
        width: '120px',
      }}
    />
  );
}
