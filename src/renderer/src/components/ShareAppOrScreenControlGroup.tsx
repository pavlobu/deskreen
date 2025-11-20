import { useState, useCallback, useEffect } from 'react';
import { Button, Icon, ControlGroup, Text } from '@blueprintjs/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import ChooseAppOrScreenOverlay from './StepsOfStepper/ChooseAppOrScreenOverlay/ChooseAppOrScreenOverlay';
import { useTranslation } from 'react-i18next';
import { IpcEvents } from '../../../common/IpcEvents.enum';

interface ShareAppOrScreenControlGroupProps {
	handleNextEntireScreen: () => void;
	handleNextApplicationWindow: () => void;
}

const useStyles = makeStyles(() =>
	createStyles({
		controlGroupRoot: {
			width: '500px',
			display: 'flex',
			position: 'relative',
			left: '20px',
		},
		shareEntireScreenButton: {
			height: '180px',
			width: '50%',
			color: 'white',
			fontSize: '20px',
			borderRadius: '20px 0px 0px 20px !important',
			textAlign: 'center',
		},
		shareEntireScreenButtonIcon: { marginBottom: '20px' },
		shareAppButton: {
			height: '180px',
			width: '50%',
			borderRadius: '0px 20px 20px 0px !important',
			color: 'white',
			fontSize: '20px',
			textAlign: 'center',
			backgroundColor: '#48AFF0 !important',
			'&:hover': {
				backgroundColor: '#4097ce !important',
			},
		},
		shareAppButtonIcon: { marginBottom: '20px' },
		orDecorationButton: {
			height: '38px',
			width: '40px',
			borderRadius: '100px !important',
			position: 'relative',
			top: '70px',
			left: '-190px !important',
			cursor: 'default',
		},
	}),
);

export default function ShareAppOrScreenControlGroup(
	props: ShareAppOrScreenControlGroupProps,
) {
	const { handleNextEntireScreen, handleNextApplicationWindow } = props;
	const classes = useStyles();
	const { t } = useTranslation();

	const [isChooseAppOrScreenOverlayOpen, setChooseAppOrScreenOverlayOpen] =
		useState(false);

	const [isEntireScreenToShareChosen, setEntireScreenToShareChosen] =
		useState(false);

	const [isWaylandSession, setIsWaylandSession] = useState(false);

	useEffect(() => {
		let cancelled = false;

		window.electron.ipcRenderer
			.invoke(IpcEvents.GetIsLinuxWaylandSession)
			.then((value: boolean) => {
				if (!cancelled) {
					setIsWaylandSession(Boolean(value));
				}
			})
			.catch((error: unknown) => {
				console.error('failed to detect session environment', error);
			});

		return () => {
			cancelled = true;
		};
	}, []);

	const handleOpenChooseAppOrScreenOverlay = useCallback(() => {
		setChooseAppOrScreenOverlayOpen(true);
	}, []);

	const handleCloseChooseAppOrScreenOverlay = useCallback(() => {
		setChooseAppOrScreenOverlayOpen(false);
	}, []);

	const handleWaylandShare = useCallback(
		async (mode: 'screen' | 'window') => {
			try {
				const sourceId: string | null =
					await window.electron.ipcRenderer.invoke(
						IpcEvents.RequestDesktopCapturerPortalSource,
						{ mode },
					);
				if (!sourceId) {
					return;
				}
				await window.electron.ipcRenderer.invoke(
					IpcEvents.SetDesktopCapturerSourceId,
					sourceId,
				);
				if (mode === 'screen') {
					handleNextEntireScreen();
				} else {
					handleNextApplicationWindow();
				}
			} catch (error) {
				console.error(
					'failed to acquire desktop capture source via portal',
					error,
				);
			}
		},
		[handleNextApplicationWindow, handleNextEntireScreen],
	);

	const handleChooseAppOverlayOpen = useCallback(() => {
		if (isWaylandSession) {
			void handleWaylandShare('window');
			return;
		}
		setEntireScreenToShareChosen(false);
		handleOpenChooseAppOrScreenOverlay();
	}, [
		handleOpenChooseAppOrScreenOverlay,
		handleWaylandShare,
		isWaylandSession,
	]);

	const handleChooseEntireScreenOverlayOpen = useCallback(() => {
		if (isWaylandSession) {
			void handleWaylandShare('screen');
			return;
		}
		setEntireScreenToShareChosen(true);
		handleOpenChooseAppOrScreenOverlay();
	}, [
		handleOpenChooseAppOrScreenOverlay,
		handleWaylandShare,
		isWaylandSession,
	]);

	return (
		<>
			<ControlGroup
				id="share-screen-or-app-btn-group"
				className={classes.controlGroupRoot}
				fill
				vertical={false}
				style={{ width: '380px' }}
			>
				<Button
					className={classes.shareEntireScreenButton}
					intent="primary"
					onClick={handleChooseEntireScreenOverlayOpen}
				>
					<Icon
						className={classes.shareEntireScreenButtonIcon}
						icon="desktop"
						size={100}
						color="white"
					/>
					<Text className="bp3-running-text">{t('entire-screen')}</Text>
				</Button>
				<Button
					className={classes.shareAppButton}
					intent="primary"
					onClick={handleChooseAppOverlayOpen}
				>
					<Icon
						className={classes.shareAppButtonIcon}
						icon="application"
						size={100}
						color="white"
					/>
					<Text className="bp3-running-text">{t('application-window')}</Text>
				</Button>
				<Button
					active
					className={classes.orDecorationButton}
					style={{ zIndex: 999 }}
				>
					{t('or')}
				</Button>
			</ControlGroup>
			<ChooseAppOrScreenOverlay
				isEntireScreenToShareChosen={isEntireScreenToShareChosen}
				isChooseAppOrScreenOverlayOpen={isChooseAppOrScreenOverlayOpen}
				handleClose={handleCloseChooseAppOrScreenOverlay}
				handleNextEntireScreen={handleNextEntireScreen}
				handleNextApplicationWindow={handleNextApplicationWindow}
				isWaylandSession={isWaylandSession}
			/>
		</>
	);
}
