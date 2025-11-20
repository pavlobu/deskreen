import React, { useContext, useEffect, useState } from 'react';
import { HTMLSelect } from '@blueprintjs/core';
import { SettingsContext } from '@renderer/contexts/SettingsContext';
import i18n_client, {
	getLangFullNameToLangISOKeyMap,
	getLangISOKeyToLangFullNameMap,
} from '../../configs/i18next.config.client';
import { IpcEvents } from '../../../../common/IpcEvents.enum';
import config from '../../../../common/app.lang.config';

export default function LanguageSelector() {
	const { setCurrentLanguageHook } = useContext(SettingsContext);

	const [languagesList, setLanguagesList] = useState([] as string[]);

	useEffect(() => {
		const tmp: string[] = [];
		const langISOKeyToLangFullNameMap = getLangISOKeyToLangFullNameMap();
		config.languages.forEach((langISOKey) => {
			const langFullName = langISOKeyToLangFullNameMap.get(langISOKey);
			if (langFullName) {
				tmp.push(langFullName);
			}
		});
		setLanguagesList(tmp);
		setCurrentLanguageHook(i18n_client.language);
	}, [setCurrentLanguageHook]);

	const onChangeLanguageHTMLSelectHandler = (
		event: React.ChangeEvent<HTMLSelectElement>,
	) => {
		if (
			event.currentTarget &&
			getLangFullNameToLangISOKeyMap().has(event.currentTarget.value)
		) {
			const newLang =
				getLangFullNameToLangISOKeyMap().get(event.currentTarget.value) ||
				'English';
			i18n_client.changeLanguage(newLang);
			window.electron.ipcRenderer.invoke(IpcEvents.AppLanguageChanged, newLang);
		}
	};

	return (
		<HTMLSelect
			value={getLangISOKeyToLangFullNameMap().get(i18n_client.language)}
			options={languagesList}
			onChange={onChangeLanguageHTMLSelectHandler}
			style={{
				borderRadius: '50px',
				width: '120px',
			}}
		/>
	);
}
