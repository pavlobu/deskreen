import { app } from 'electron';
import ConnectedDevicesService from '../../features/ConnectedDevicesService';
import SharingSessionService from '../../features/SharingSessionService';
import RendererWebrtcHelpersService from '../../features/PeerConnectionHelperRendererService';
import RoomIDService from '../../server/RoomIDService';
import DesktopCapturerSources from '../../features/DesktopCapturerSourcesService';
import { DeskreenGlobal } from './DeskreenGlobal';

export default (appPath: string) => {
  const deskreenGlobal: DeskreenGlobal = (global as unknown) as DeskreenGlobal;

  deskreenGlobal.appPath = appPath;

  deskreenGlobal.rendererWebrtcHelpersService = new RendererWebrtcHelpersService(
    appPath
  );
  deskreenGlobal.roomIDService = new RoomIDService();
  deskreenGlobal.connectedDevicesService = new ConnectedDevicesService();
  deskreenGlobal.sharingSessionService = new SharingSessionService(
    deskreenGlobal.roomIDService,
    deskreenGlobal.connectedDevicesService,
    deskreenGlobal.rendererWebrtcHelpersService
  );
  deskreenGlobal.desktopCapturerSourcesService = new DesktopCapturerSources();
  deskreenGlobal.latestAppVersion = '';
  deskreenGlobal.currentAppVersion = app.getVersion();
};
