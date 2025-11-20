import {
	installExtension,
	REACT_DEVELOPER_TOOLS,
} from 'electron-devtools-installer';

export default async function installExtensions(): Promise<void> {
	// const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
	// const extensions = ['REACT_DEVELOPER_TOOLS', 'REDUX_DEVTOOLS'];
	//
	// return Promise.all(
	//   extensions.map((name) => installer.default(installer[name], forceDownload)),
	// ).catch(console.log);

	installExtension([REACT_DEVELOPER_TOOLS])
		.then(([react]) => console.log(`Added Extensions: ${react.name}`))
		.catch((err) => console.log('An error occurred: ', err));
}
