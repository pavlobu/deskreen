import ConnectedDevicesService from '../../features/ConnectedDevicesService';
import SharingSessionService from '../../features/SharingSessionService';
import RendererWebrtcHelpersService from '../../features/PeerConnectionHelperRendererService';
import RoomIDService from '../../server/RoomIDService';
import DesktopCapturerSources from '../../features/DesktopCapturerSourcesService';
import DeskreenGlobalService from './DeskreenGlobalService.enum';

interface DeskreenGlobal {
  appPath: string;
  rendererWebrtcHelpersService: RendererWebrtcHelpersService;
  roomIDService: RoomIDService;
  connectedDevicesService: ConnectedDevicesService;
  sharingSessionService: SharingSessionService;
  desktopCapturerSourcesService: DesktopCapturerSources;
}
