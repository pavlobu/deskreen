import { Display, ipcMain, BrowserWindow, screen } from 'electron';
import settings from 'electron-settings';
import i18n from '../configs/i18next.config';
import ConnectedDevicesService from '../features/ConnectedDevicesService';
import SharingSession from '../features/SharingSessionService/SharingSession';
import RoomIDService from '../server/RoomIDService';
import getDeskreenGlobal from '../utils/mainProcessHelpers/getDeskreenGlobal';
import signalingServer from '../server';
import { DeskreenGlobalService } from '../utils/mainProcessHelpers/DeskreenGlobalService.enum';

const v4IPGetter = require('internal-ip').v4;

export default function initIpcMainHandlers(
  mainWindow: BrowserWindow | null,
  latestVersion: string,
  appVersion: string
) {
  ipcMain.on('client-changed-language', async (_, newLangCode) => {
    i18n.changeLanguage(newLangCode);
    await settings.set('appLanguage', newLangCode);
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
      }
    );

    deskreenGlobal.rendererWebrtcHelpersService.helpers.forEach(
      (helperWindow) => {
        helperWindow.close();
      }
    );

    deskreenGlobal.sharingSessionService.waitingForConnectionSharingSession = null;
    deskreenGlobal.rendererWebrtcHelpersService.helpers.clear();
    deskreenGlobal.sharingSessionService.sharingSessions.clear();
  });

  ipcMain.handle('get-latest-version', () => {
    return latestVersion;
  });

  ipcMain.handle('get-current-version', () => {
    return appVersion;
  });

  ipcMain.handle('get-local-lan-ip', async () => {
    if (
      process.env.RUN_MODE === 'dev' ||
      process.env.NODE_ENV === 'production'
    ) {
      const ip = await v4IPGetter();
      return ip;
    }
    return '255.255.255.255';
  });

  ipcMain.handle('get-app-path', () => {
    const deskreenGlobal = getDeskreenGlobal();
    return deskreenGlobal.appPath;
  });

  ipcMain.handle('unmark-room-id-as-taken', (_, roomID) => {
    const deskreenGlobal = getDeskreenGlobal();
    deskreenGlobal[DeskreenGlobalService.RoomIDService].unmarkRoomIDAsTaken(
      roomID
    );
  });
}
