import { FocusStyleManager } from '@blueprintjs/core';
import { SettingsProvider } from './SettingsProvider';
import HomePage from '@renderer/containers/HomePage';

FocusStyleManager.onlyShowFocusOnTabs();

const Root = () => {
	return (
		<SettingsProvider>
			<HomePage />
		</SettingsProvider>
	);
};

export default Root;
