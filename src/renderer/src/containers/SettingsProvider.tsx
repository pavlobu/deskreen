import React, { useState } from 'react';
import { SettingsContext } from '@renderer/contexts/SettingsContext';

// TODO: move to 'constants' tsx file ?
export const LIGHT_UI_BACKGROUND = 'rgba(240, 248, 250, 1)';

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [currentLanguage, setCurrentLanguage] = useState('en');

	const setCurrentLanguageHook = (newLang: string): void => {
		setCurrentLanguage(newLang);
	};

	const value = {
		currentLanguage,
		setCurrentLanguageHook,
	};

	return (
		<SettingsContext.Provider value={value}>
			{children}
		</SettingsContext.Provider>
	);
};
