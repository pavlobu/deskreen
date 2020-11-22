import ConnectedDevicesService from '../features/ConnectedDevicesService';
import SharingSessionService from '../features/SharingSessionsService';
import RendererWebrtcHelpersService from '../features/PeerConnectionHelperRendererService';
import RoomIDService from '../server/RoomIDService';
import DesktopCapturerSources from '../features/DesktopCapturerSourcesService';

interface DeskreenGlobal {
  appPath: string;
  rendererWebrtcHelpersService: RendererWebrtcHelpersService;
  roomIDService: RoomIDService;
  connectedDevicesService: ConnectedDevicesService;
  sharingSessionService: SharingSessionService;
  desktopCapturerSourcesService: DesktopCapturerSources;
}
