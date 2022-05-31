import ConnectedDevicesService from '../../features/ConnectedDevicesService';
import SharingSessionService from '../../features/SharingSessionService';
import RendererWebrtcHelpersService from '../../features/PeerConnectionHelperRendererService';
import RoomIDService from '../../server/RoomIDService';
import DesktopCapturerSourcesService from '../../features/DesktopCapturerSourcesService';

interface DeskreenGlobal {
  appPath: string;
  rendererWebrtcHelpersService: RendererWebrtcHelpersService;
  roomIDService: RoomIDService;
  connectedDevicesService: ConnectedDevicesService;
  sharingSessionService: SharingSessionService;
  desktopCapturerSourcesService: DesktopCapturerSourcesService;
  latestAppVersion: string;
  currentAppVersion: string;
}
