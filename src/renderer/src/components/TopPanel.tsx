import React from 'react';
import { Button, H3, Icon, Position, Tag, Tooltip } from '@blueprintjs/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { Col, Row } from 'react-flexbox-grid';
import SettingsOverlay from './SettingsOverlay/SettingsOverlay';
import ConnectedDevicesListDrawer from './ConnectedDevicesListDrawer';
import { useTranslation } from 'react-i18next';
import { IpcEvents } from '../../../common/IpcEvents.enum';
import RedHeartTwemojiPNG from '../assets/red_heart_2764_twemoji_120x120.png';

const useStyles = makeStyles(() =>
	createStyles({
		topPanelRoot: {
			display: 'flex',
			flexDirection: 'column',
			alignItems: 'center',
			paddingTop: '15px',
			marginBottom: '20px',
			position: 'relative',
			gap: '12px',
		},
		donateButtonRoot: {
			display: 'flex',
			justifyContent: 'center',
			width: '100%',
			marginTop: '4px',
		},
		logoWithAppName: { margin: '0 auto' },
		appNameHeader: {
			margin: '0 auto',
			paddingTop: '5px',
			fontFamily: 'Lexend Peta',
			fontSize: '20px',
			color: '#e2791b',
			cursor: 'default !important',
		},
		donateButton: {
			borderRadius: '100px',
			padding: '0',
			height: '40px',
			background:
				'linear-gradient(135deg, hsl(258, 90%, 66%) 0%, hsl(210, 96%, 62%) 30%, hsl(192, 94%, 44%) 70%, hsl(28, 96%, 58%) 100%)',
			border: 'none',
			boxShadow:
				'0 4px 12px rgba(102, 51, 204, 0.4), 0 2px 4px rgba(102, 51, 204, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
			transition: 'all 0.2s ease',
			'&:hover': {
				transform: 'translateY(-1px)',
				boxShadow:
					'0 6px 16px rgba(102, 51, 204, 0.5), 0 3px 6px rgba(102, 51, 204, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
			},
		},
		donateButtonContent: {
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			height: '100%',
			padding: '0 16px',
			gap: '8px',
		},
		donateButtonIcon: {
			width: '20px',
			height: '20px',
			display: 'block',
			verticalAlign: 'middle',
			flexShrink: 0,
			filter: 'brightness(1.1) drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2))',
		},
		donateButtonLabel: {
			display: 'flex',
			alignItems: 'center',
			lineHeight: '1',
			fontSize: '14px',
			fontWeight: 600,
			color: '#ffffff',
			textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
		},
		topPanelControlButtonsRoot: {
			display: 'flex',
			alignItems: 'center',
			gap: '12px',
		},
		topPanelControlsWrapper: {
			position: 'absolute',
			right: '15px',
			top: '15px',
			display: 'flex',
			flexDirection: 'column',
			alignItems: 'flex-end',
			gap: '6px',
		},
		topPanelControlButton: {
			width: '40px',
			height: '40px',
			borderRadius: '50px',
			cursor: 'default !important',
		},
		topPanelControlButtonMargin: {
			cursor: 'default !important',
			position: 'relative',
		},
		updateBadge: {
			borderRadius: '12px',
			cursor: 'pointer',
			boxShadow: 'none',
		},
		topPanelIconOfControlButton: {
			cursor: 'default !important',
		},
		connectedDevicesBadge: {
			position: 'absolute',
			top: '-4px',
			right: '-4px',
			backgroundColor: '#ff3b30',
			color: '#ffffff',
			borderRadius: '10px',
			minWidth: '20px',
			height: '20px',
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			fontSize: '12px',
			fontWeight: 600,
			padding: '0 6px',
			boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
			zIndex: 10,
			lineHeight: '1',
		},
	}),
);

interface Props {
	handleReset: () => void;
}

export default function TopPanel({ handleReset }: Props): React.ReactElement {
	const { t } = useTranslation();
	const classes = useStyles();

	const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
	const [isConnectedDevicesDrawerOpen, setIsConnectedDevicesDrawerOpen] =
		React.useState(false);
	const [latestVersion, setLatestVersion] = React.useState('');
	const [currentVersion, setCurrentVersion] = React.useState('');
	const [connectedDevicesCount, setConnectedDevicesCount] = React.useState(0);

	const handleSettingsOpen = React.useCallback(() => {
		setIsSettingsOpen(true);
	}, []);

	const handleSettingsClose = React.useCallback(() => {
		setIsSettingsOpen(false);
	}, []);

	const handleToggleConnectedDevicesListDrawer = React.useCallback(() => {
		setIsConnectedDevicesDrawerOpen(!isConnectedDevicesDrawerOpen);
	}, [isConnectedDevicesDrawerOpen]);

	const donateTooltipContent = t(
		'if-you-like-deskreen-ce-consider-contributing-financially-deskreen-ce-is-open-source-your-donations-keep-us-motivated-to-make-deskreen-ce-even-better',
	);

	const handleDonateButtonClick = React.useCallback(() => {
		window.electron.ipcRenderer.invoke(
			IpcEvents.OpenExternalLink,
			'https://deskreen.com/#contribute',
		);
	}, []);

	const handleTutorialButtonClick = React.useCallback(() => {
		window.electron.ipcRenderer.invoke(
			IpcEvents.OpenExternalLink,
			'https://deskreen.com/howto',
		);
	}, []);

	const handleOpenDownloadPage = React.useCallback((): void => {
		void window.electron.ipcRenderer.invoke(
			IpcEvents.OpenExternalLink,
			'https://deskreen.com/download',
		);
	}, []);

	React.useEffect(() => {
		const fetchVersions = async (): Promise<void> => {
			const [latest, current] = await Promise.all([
				window.electron.ipcRenderer.invoke('get-latest-version'),
				window.electron.ipcRenderer.invoke('get-current-version'),
			]);
			if (typeof latest === 'string') {
				setLatestVersion(latest);
			}
			if (typeof current === 'string') {
				setCurrentVersion(current);
			}
		};

		void fetchVersions();
	}, []);

	React.useEffect(() => {
		const fetchConnectedDevicesCount = async (): Promise<void> => {
			try {
				const devices = await window.electron.ipcRenderer.invoke(
					IpcEvents.GetConnectedDevices,
				);
				if (Array.isArray(devices)) {
					setConnectedDevicesCount(devices.length);
				}
			} catch (e) {
				console.error(e);
			}
		};

		fetchConnectedDevicesCount();

		const connectedDevicesInterval = setInterval(
			fetchConnectedDevicesCount,
			2000,
		);

		return () => {
			clearInterval(connectedDevicesInterval);
		};
	}, []);

	const hasUpdate =
		latestVersion !== '' &&
		currentVersion !== '' &&
		latestVersion !== currentVersion;

	const renderDonateButton = (
		<Tooltip content={donateTooltipContent} position={Position.BOTTOM}>
			<Button
				id="top-panel-donate-button"
				className={classes.donateButton}
				onClick={handleDonateButtonClick}
			>
				<div className={classes.donateButtonContent}>
					<img
						src={RedHeartTwemojiPNG}
						className={classes.donateButtonIcon}
						alt="heart"
					/>
					<span className={classes.donateButtonLabel}>{t('donate')}</span>
				</div>
			</Button>
		</Tooltip>
	);

	const renderConnectedDevicesListButton = (
		<div className={classes.topPanelControlButtonMargin}>
			<Tooltip content={t('connected-devices')} position={Position.BOTTOM}>
				<Button
					id="top-panel-connected-devices-list-button"
					intent="primary"
					className={classes.topPanelControlButton}
					onClick={handleToggleConnectedDevicesListDrawer}
				>
					<Icon
						className={classes.topPanelIconOfControlButton}
						icon="th-list"
						size={20}
					/>
				</Button>
			</Tooltip>
			{connectedDevicesCount > 0 && (
				<span className={classes.connectedDevicesBadge}>
					{connectedDevicesCount}
				</span>
			)}
		</div>
	);

	const renderTutorialButton = (
		<div className={classes.topPanelControlButtonMargin}>
			<Tooltip content={t('tutorial')} position={Position.BOTTOM}>
				<Button
					id="top-panel-tutorial-button"
					className={classes.topPanelControlButton}
					onClick={handleTutorialButtonClick}
				>
					<Icon
						className={classes.topPanelIconOfControlButton}
						icon="learning"
						size={22}
					/>
				</Button>
			</Tooltip>
		</div>
	);

	const renderHelpButton = (
		<div className={classes.topPanelControlButtonMargin}>
			<Tooltip content={t('fix-reset-tooltip')} position={Position.BOTTOM}>
				<Button
					id="top-panel-help-button"
					intent="danger"
					className={classes.topPanelControlButton}
					onClick={() => {
						Promise.resolve(handleReset()).then(() => {
							window.electron.ipcRenderer.invoke(
								IpcEvents.CreateWaitingForConnectionSharingSession,
							);
						});
					}}
				>
					<Icon
						className={classes.topPanelIconOfControlButton}
						icon="lifesaver"
						size={22}
					/>
				</Button>
			</Tooltip>
		</div>
	);

	const renderSettingsButton = (
		<div className={classes.topPanelControlButtonMargin}>
			<Tooltip content={t('settings')} position={Position.BOTTOM}>
				<Button
					id="top-panel-settings-button"
					onClick={handleSettingsOpen}
					className={classes.topPanelControlButton}
				>
					<Icon
						className={classes.topPanelIconOfControlButton}
						icon="cog"
						size={22}
					/>
				</Button>
			</Tooltip>
		</div>
	);

	const renderLogoWithAppName = (
		<div
			id="logo-with-popover-visit-website"
			className={classes.logoWithAppName}
		>
			<H3>Deskreen Community Edition</H3>
		</div>
	);

	return (
		<>
			<div className={classes.topPanelRoot}>
				<Row middle="xs" center="xs" style={{ width: '100%' }}>
					<Col>{renderLogoWithAppName}</Col>
				</Row>
				<div className={classes.donateButtonRoot}>{renderDonateButton}</div>
				<div className={classes.topPanelControlsWrapper}>
					<div className={classes.topPanelControlButtonsRoot}>
						{renderConnectedDevicesListButton}
						{renderHelpButton}
						{renderTutorialButton}
						{renderSettingsButton}
					</div>
					{hasUpdate ? (
						<Tag
							minimal
							intent="success"
							round
							className={classes.updateBadge}
							role="button"
							onClick={handleOpenDownloadPage}
							onKeyDown={(event) => {
								if (event.key === 'Enter' || event.key === ' ') {
									event.preventDefault();
									handleOpenDownloadPage();
								}
							}}
							tabIndex={0}
						>
							{t('new-version-available')}
						</Tag>
					) : null}
				</div>
			</div>
			{isSettingsOpen ? (
				<SettingsOverlay
					isSettingsOpen={isSettingsOpen}
					handleClose={handleSettingsClose}
				/>
			) : (
				<></>
			)}
			{isConnectedDevicesDrawerOpen ? (
				<ConnectedDevicesListDrawer
					isOpen={isConnectedDevicesDrawerOpen}
					handleToggle={handleToggleConnectedDevicesListDrawer}
					handleReset={handleReset}
				/>
			) : (
				<></>
			)}
		</>
	);
}
