import { Display, ipcMain, BrowserWindow, screen, clipboard, shell } from 'electron';
import i18n from '../configs/i18next.config';
import { ConnectedDevicesService } from '../../features/ConnectedDevicesService';
import SharingSession from '../../features/SharingSessionService/SharingSession';
import RoomIDService from '../../server/RoomIDService';
import { signalingServer } from '../../server';
import { onDeviceConnectedCallback } from '../../server/onDeviceConnectedCallback';
import SharingSessionStatusEnum from '../../features/SharingSessionService/SharingSessionStatusEnum';
import getMyLocalIpV4 from './getMyLocalIpV4';
import { getDeskreenGlobal } from './getDeskreenGlobal';
import { IpcEvents } from '../../common/IpcEvents.enum';
import { ElectronStoreKeys } from '../../common/ElectronStoreKeys.enum';
import { store } from '../../common/deskreen-electron-store';

export const initIpcMainHandlers = (mainWindow: BrowserWindow): void => {
  ipcMain.on('client-changed-language', async (_, newLangCode) => {
    i18n.changeLanguage(newLangCode);
    if (store.has(ElectronStoreKeys.AppLanguage)) {
      if (store.get(ElectronStoreKeys.AppLanguage) === newLangCode) {
        return;
      }
      store.delete(ElectronStoreKeys.AppLanguage);
    }
    store.set(ElectronStoreKeys.AppLanguage, newLangCode);
  });

  ipcMain.handle('get-signaling-server-port', () => {
    if (mainWindow === null) return;
    mainWindow.webContents.send('sending-port-from-main', signalingServer.port);
  });

  ipcMain.handle('get-all-displays', () => {
    return screen.getAllDisplays();
  });

  ipcMain.handle('get-display-size-by-display-id', (_, displayID: string) => {
    const display = screen.getAllDisplays().find((d: Display) => {
      return `${d.id}` === displayID;
    });

    if (display) {
      return display.size;
    }
    return undefined;
  });

  ipcMain.handle('main-window-onbeforeunload', () => {
    const deskreenGlobal = getDeskreenGlobal();
    deskreenGlobal.connectedDevicesService = new ConnectedDevicesService();
    deskreenGlobal.roomIDService = new RoomIDService();
    deskreenGlobal.sharingSessionService.sharingSessions.forEach(
      (sharingSession: SharingSession) => {
        sharingSession.denyConnectionForPartner();
        sharingSession.destroy();
      },
    );

    deskreenGlobal.rendererWebrtcHelpersService.helpers.forEach((helperWindow) => {
      helperWindow.close();
    });

    deskreenGlobal.sharingSessionService.waitingForConnectionSharingSession = null;
    deskreenGlobal.rendererWebrtcHelpersService.helpers.clear();
    deskreenGlobal.sharingSessionService.sharingSessions.clear();
  });

  ipcMain.handle('get-latest-version', () => {
    return getDeskreenGlobal().latestAppVersion;
  });

  ipcMain.handle('get-current-version', () => {
    return getDeskreenGlobal().currentAppVersion;
  });

  ipcMain.handle('get-local-lan-ip', async () => {
    const ip = getMyLocalIpV4(); // Call the function
    return ip;
  });

  ipcMain.handle(IpcEvents.GetPort, () => {
    return signalingServer.port;
  });

  ipcMain.handle(IpcEvents.GetAppPath, () => {
    const deskreenGlobal = getDeskreenGlobal();
    return deskreenGlobal.appPath;
  });

  ipcMain.handle(IpcEvents.UnmarkRoomIDAsTaken, (_, roomID) => {
    const deskreenGlobal = getDeskreenGlobal();
    deskreenGlobal.roomIDService.unmarkRoomIDAsTaken(roomID);
  });

  async function createWaitingForConnectionSharingSession(roomID?: string): Promise<void> {
    try {
      const deskreenGlobal = getDeskreenGlobal();
      if (deskreenGlobal.sharingSessionService.waitingForConnectionSharingSession !== null) {
        return;
      }
      const waitingSession = await deskreenGlobal.sharingSessionService.createWaitingForConnectionSharingSession(
        roomID,
      );
      waitingSession.setOnDeviceConnectedCallback(onDeviceConnectedCallback);
    } catch (error) {
      console.error('Failed to create waiting sharing session', error);
    }
  }

  ipcMain.handle(
    IpcEvents.CreateWaitingForConnectionSharingSession,
    async (_, roomID?: string) => {
      await createWaitingForConnectionSharingSession(roomID);
    },
  );

  function resetWaitingForConnectionSharingSession(): void {
    const sharingSession =
      getDeskreenGlobal().sharingSessionService.waitingForConnectionSharingSession;
    const roomID = sharingSession?.roomID;
    sharingSession?.denyConnectionForPartner();
    sharingSession?.disconnectByHostMachineUser();
    sharingSession?.destroy();
    sharingSession?.setStatus(SharingSessionStatusEnum.NOT_CONNECTED);
    getDeskreenGlobal().sharingSessionService.sharingSessions.delete(sharingSession?.id as string);
    if (roomID) {
      getDeskreenGlobal().roomIDService.unmarkRoomIDAsTaken(roomID);
    }
    getDeskreenGlobal().sharingSessionService.waitingForConnectionSharingSession = null;
  }

  ipcMain.handle(IpcEvents.ResetWaitingForConnectionSharingSession, () => {
    resetWaitingForConnectionSharingSession();
  });

	const removeViewerAvailabilityListener =
		getDeskreenGlobal().connectedDevicesService.addAvailabilityListener((state) => {
			const isAvailable = state === 'available';
			const targetWindow = mainWindow?.isDestroyed() ? null : mainWindow;
			if (targetWindow) {
				targetWindow.webContents.send(IpcEvents.ViewerConnectionAvailabilityChanged, {
					isAvailable,
				});
			}
			if (isAvailable) {
				void createWaitingForConnectionSharingSession();
			}
		});

	mainWindow.on('closed', () => {
		removeViewerAvailabilityListener();
	});

  ipcMain.handle(IpcEvents.SetDeviceConnectedStatus, () => {
    if (getDeskreenGlobal().sharingSessionService.waitingForConnectionSharingSession !== null) {
      const sharingSession =
        getDeskreenGlobal().sharingSessionService.waitingForConnectionSharingSession;
      sharingSession?.setStatus(SharingSessionStatusEnum.CONNECTED);
    }
  });

  ipcMain.handle(IpcEvents.GetSourceDisplayIDByDesktopCapturerSourceID, (_, sourceId) => {
    return getDeskreenGlobal().desktopCapturerSourcesService.getSourceDisplayIDByDisplayCapturerSourceID(
      sourceId,
    );
  });

  ipcMain.handle(IpcEvents.DisconnectPeerAndDestroySharingSessionBySessionID, (_, sessionId) => {
    const sharingSession = getDeskreenGlobal().sharingSessionService.sharingSessions.get(sessionId);
    if (sharingSession) {
      getDeskreenGlobal().connectedDevicesService.disconnectDeviceByID(sharingSession.deviceID);
    }
    sharingSession?.disconnectByHostMachineUser();
    sharingSession?.destroy();
    getDeskreenGlobal().sharingSessionService.sharingSessions.delete(sessionId);
  });

  ipcMain.handle(IpcEvents.GetDesktopCapturerSourceIdBySharingSessionId, (_, sessionId) => {
    return getDeskreenGlobal().sharingSessionService.sharingSessions.get(sessionId)
      ?.desktopCapturerSourceID;
  });

  ipcMain.handle(IpcEvents.GetConnectedDevices, () => {
    return getDeskreenGlobal().connectedDevicesService.getDevices();
  });

	ipcMain.handle(IpcEvents.GetViewerConnectionAvailability, () => {
		return getDeskreenGlobal().connectedDevicesService.isSlotAvailable();
	});

  ipcMain.handle(IpcEvents.DisconnectDeviceById, (_, id) => {
    getDeskreenGlobal().connectedDevicesService.disconnectDeviceByID(id);
  });

  ipcMain.handle(IpcEvents.DisconnectAllDevices, () => {
    getDeskreenGlobal().connectedDevicesService.disconnectAllDevices();
  });

  ipcMain.handle(IpcEvents.AppLanguageChanged, (_, newLang) => {
    if (store.has(ElectronStoreKeys.AppLanguage)) {
      store.delete(ElectronStoreKeys.AppLanguage);
    }
    store.set(ElectronStoreKeys.AppLanguage, newLang);
    getDeskreenGlobal().sharingSessionService.sharingSessions.forEach((sharingSession) => {
      sharingSession?.appLanguageChanged();
    });
    i18n.changeLanguage(newLang);
  });

  ipcMain.handle(IpcEvents.GetDesktopCapturerServiceSourcesMap, () => {
    const map = getDeskreenGlobal().desktopCapturerSourcesService.getSourcesMap();
    const res = {};

    for (const key of map.keys()) {
      const source = map.get(key);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      res[key] = {
        source: {
          thumbnail: source?.source.thumbnail?.toDataURL(),
          appIcon: source?.source.appIcon?.toDataURL(),
          name: source?.source.name,
        },
      };
    }
    return res;
  });

  ipcMain.handle(IpcEvents.GetDesktopCapturerServiceSourcesByIds, (_, ids: string[]) => {
    const map = getDeskreenGlobal().desktopCapturerSourcesService.getSourcesMap();
    const res = {};

    ids.forEach((id) => {
      const source = map.get(id);
      if (!source) return;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      res[id] = {
        source: {
          thumbnail: source?.source.thumbnail?.toDataURL(),
          appIcon: source?.source.appIcon?.toDataURL(),
          name: source?.source.name,
        },
      };
    });
    return res;
  });

  ipcMain.handle(IpcEvents.GetWaitingForConnectionSharingSessionSourceId, () => {
    return getDeskreenGlobal().sharingSessionService.waitingForConnectionSharingSession
      ?.desktopCapturerSourceID;
  });

	function startSharingOnWaitingForConnectionSharingSession(): void {
		const deskreenGlobal = getDeskreenGlobal();
		const { connectedDevicesService, sharingSessionService, roomIDService } = deskreenGlobal;
		if (!connectedDevicesService.isSlotAvailable()) {
			const waitingSession = sharingSessionService.waitingForConnectionSharingSession;
			waitingSession?.denyConnectionForPartner();
			waitingSession?.setStatus(SharingSessionStatusEnum.NOT_CONNECTED);
			sharingSessionService.waitingForConnectionSharingSession = null;
			connectedDevicesService.resetPendingConnectionDevice();
			return;
		}

		const pendingDevice = connectedDevicesService.pendingConnectionDevice;
		if (!pendingDevice.id) {
			return;
		}

		const sharingSession = sharingSessionService.waitingForConnectionSharingSession;
		if (sharingSession !== null) {
			roomIDService.unmarkRoomIDAsTaken(sharingSession.roomID);
		}

		try {
			connectedDevicesService.addDevice(pendingDevice);
		} catch (error) {
			console.error('failed to occupy single viewer slot', error);
			if (sharingSession !== null) {
				sharingSession.setStatus(SharingSessionStatusEnum.ERROR);
				sharingSession.denyConnectionForPartner();
				sharingSessionService.waitingForConnectionSharingSession = null;
			}
			connectedDevicesService.resetPendingConnectionDevice();
			return;
		}

		if (sharingSession !== null) {
			sharingSession.callPeer();
			sharingSession.setStatus(SharingSessionStatusEnum.SHARING);
			sharingSessionService.waitingForConnectionSharingSession = null;
		}

		connectedDevicesService.resetPendingConnectionDevice();
	}

  ipcMain.handle(IpcEvents.StartSharingOnWaitingForConnectionSharingSession, () => {
    startSharingOnWaitingForConnectionSharingSession();
  });

  ipcMain.handle(IpcEvents.GetPendingConnectionDevice, () => {
    return getDeskreenGlobal().connectedDevicesService.pendingConnectionDevice;
  });

  ipcMain.handle(IpcEvents.GetWaitingForConnectionSharingSessionRoomId, () => {
    if (getDeskreenGlobal().sharingSessionService.waitingForConnectionSharingSession === null) {
      return undefined;
    }
    return getDeskreenGlobal().sharingSessionService.waitingForConnectionSharingSession?.roomID;
  });

  ipcMain.handle(
    IpcEvents.GetDesktopSharingSourceIds,
    async (_, { isEntireScreenToShareChosen }) => {
      // ensure sources are up to date at request time
      await getDeskreenGlobal().desktopCapturerSourcesService.refreshDesktopCapturerSources();

      if (isEntireScreenToShareChosen === true) {
        return getDeskreenGlobal()
          .desktopCapturerSourcesService.getScreenSources()
          .map((source) => source.id);
      }
      return getDeskreenGlobal()
        .desktopCapturerSourcesService.getAppWindowSources()
        .map((source) => source.id);
    },
  );

  ipcMain.handle(IpcEvents.SetDesktopCapturerSourceId, (_, id) => {
    getDeskreenGlobal().sharingSessionService.waitingForConnectionSharingSession?.setDesktopCapturerSourceID(
      id,
    );
  });

  ipcMain.handle(IpcEvents.NotifyAllSessionsWithAppThemeChanged, () => {
    getDeskreenGlobal().sharingSessionService.sharingSessions.forEach((sharingSession) => {
      sharingSession?.appThemeChanged();
    });
  });

  ipcMain.handle(IpcEvents.GetIsFirstTimeAppStart, () => {
    if (store.has(ElectronStoreKeys.IsNotFirstTimeAppStart)) {
      return false;
    }
    return true;
  });

  ipcMain.handle(IpcEvents.SetAppStartedOnce, () => {
    if (store.has(ElectronStoreKeys.IsNotFirstTimeAppStart)) {
      store.delete(ElectronStoreKeys.IsNotFirstTimeAppStart);
    }
    store.set(ElectronStoreKeys.IsNotFirstTimeAppStart, 'true');
  });

  ipcMain.handle(IpcEvents.GetIsAppDarkTheme, () => {
    if (store.has(ElectronStoreKeys.IsAppDarkTheme)) {
      return store.get(ElectronStoreKeys.IsAppDarkTheme);
    }
    return false;
  });

  ipcMain.handle(IpcEvents.SetIsAppDarkTheme, (_, isDarkTheme) => {
    if (store.has(ElectronStoreKeys.IsAppDarkTheme)) {
      store.delete(ElectronStoreKeys.IsAppDarkTheme);
    }
    store.set(ElectronStoreKeys.IsAppDarkTheme, isDarkTheme);
  });

  ipcMain.handle(IpcEvents.GetAppLanguage, () => {
    if (store.has(ElectronStoreKeys.AppLanguage)) {
      return store.get(ElectronStoreKeys.AppLanguage);
    }
    return 'en';
  });

  ipcMain.handle(IpcEvents.DestroySharingSessionById, (_, id) => {
    if (getDeskreenGlobal().sharingSessionService.waitingForConnectionSharingSession?.id === id) {
      getDeskreenGlobal().sharingSessionService.waitingForConnectionSharingSession = null;
    }
    const sharingSession = getDeskreenGlobal().sharingSessionService.sharingSessions.get(id);
    sharingSession?.setStatus(SharingSessionStatusEnum.DESTROYED);
    sharingSession?.destroy();
    getDeskreenGlobal().sharingSessionService.sharingSessions.delete(id);
  });

  ipcMain.handle(IpcEvents.OpenExternalLink, (_, url: string) => {
    if (typeof url !== 'string') {
      return;
    }
    shell.openExternal(url);
  });

  ipcMain.handle(IpcEvents.WriteTextToClipboard, (_, text) => {
    clipboard.writeText(text);
  });

  void createWaitingForConnectionSharingSession();
};
