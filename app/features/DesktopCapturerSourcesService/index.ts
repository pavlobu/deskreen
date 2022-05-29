/* eslint-disable no-async-promise-executor */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable class-methods-use-this */
import { desktopCapturer, DesktopCapturerSource } from 'electron';
import Logger from '../../utils/LoggerWithFilePrefix';
import DesktopCapturerSourceType from './DesktopCapturerSourceType';

export function getSourceTypeFromSourceID(
  id: string
): DesktopCapturerSourceType {
  if (id.includes(DesktopCapturerSourceType.SCREEN)) {
    return DesktopCapturerSourceType.SCREEN;
  }
  return DesktopCapturerSourceType.WINDOW;
}

type SourcesDisappearListener = (ids: string[]) => void;
type SharingSessionID = string;

class DesktopCapturerSourcesService {
  sources: Map<string, DesktopCapturerSourceWithType>;

  lastAvailableScreenIDs: string[];

  lastAvailableWindowIDs: string[];

  onWindowClosedListeners: Map<SharingSessionID, SourcesDisappearListener[]>;

  onScreenDisconnectedListeners: Map<
    SharingSessionID,
    SourcesDisappearListener[]
  >;

  log = new Logger(__filename);

  constructor() {
    this.sources = new Map<string, DesktopCapturerSourceWithType>();
    this.lastAvailableScreenIDs = [];
    this.lastAvailableWindowIDs = [];
    this.onWindowClosedListeners = new Map<
      SharingSessionID,
      SourcesDisappearListener[]
    >();
    this.onScreenDisconnectedListeners = new Map<
      SharingSessionID,
      SourcesDisappearListener[]
    >();

    this.startRefreshDesktopCapturerSourcesLoop();
    this.startPollForInactiveListenersLoop();
  }

  getSourcesMap(): Map<string, DesktopCapturerSourceWithType> {
    return this.sources;
  }

  startRefreshDesktopCapturerSourcesLoop() {
    setInterval(() => {
      this.refreshDesktopCapturerSources();
    }, 5000);
  }

  getScreenSources(): DesktopCapturerSource[] {
    const screenSources: DesktopCapturerSource[] = [];
    [...this.sources.keys()].forEach((key) => {
      const source = this.sources.get(key);
      if (!source) return;
      if (source.type === DesktopCapturerSourceType.SCREEN) {
        screenSources.push(source.source);
      }
    });
    return screenSources;
  }

  getAppWindowSources(): DesktopCapturerSource[] {
    const appWindowSources: DesktopCapturerSource[] = [];
    [...this.sources.keys()].forEach((key) => {
      const source = this.sources.get(key);
      if (!source) return;
      if (source.type === DesktopCapturerSourceType.WINDOW) {
        appWindowSources.push(source.source);
      }
    });
    return appWindowSources;
  }

  getSourceDisplayIDByDisplayCapturerSourceID(sourceID: string) {
    let displayID = '';
    [...this.sources.keys()].forEach((key) => {
      const source = this.sources.get(key);
      if (!source) return;
      if (source.source.id === sourceID) {
        displayID = source.source.display_id;
      }
    });
    return displayID;
  }

  addWindowClosedListener(
    _sharingSessionID: string,
    _callback: SourcesDisappearListener
  ) {
    // TODO: implement logic
  }

  addScreenDisconnectedListener(
    _sharingSessionID: string,
    _callback: SourcesDisappearListener
  ) {
    // TODO: implement logic
  }

  async updateDesktopCapturerSources() {
    // TODO: implement logic of checking if last sources match new sources,
    // TODO: if source is gone, do proper actions and notify user if needed
    // this.lastAvailableScreenIDs = [];
    // this.lastAvailableWindowIDs = [];

    // [...this.sources.keys()].forEach((key) => {
    //   const oldSource = this.sources.get(key);
    //   if (!oldSource) return;
    //   if (oldSource.type === DesktopCapturerSourceType.WINDOW) {
    //     this.lastAvailableWindowIDs.push(oldSource.source.id);
    //   } else if (oldSource.type === DesktopCapturerSourceType.SCREEN) {
    //     this.lastAvailableScreenIDs.push(oldSource.source.id);
    //   }
    // });

    this.sources = await this.getDesktopCapturerSources();
  }

  // eslint-disable-next-line class-methods-use-this
  getDesktopCapturerSources(): Promise<
    Map<string, DesktopCapturerSourceWithType>
  > {
    return new Promise<Map<string, DesktopCapturerSourceWithType>>(
      async (resolve, reject) => {
        const newSources = new Map<string, DesktopCapturerSourceWithType>();
        try {
          const capturerSources = await desktopCapturer.getSources({
            types: [
              DesktopCapturerSourceType.WINDOW,
              DesktopCapturerSourceType.SCREEN,
            ],
            thumbnailSize: { width: 500, height: 500 },
            fetchWindowIcons: true, // TODO: use window icons in app UI !
          });
          capturerSources.forEach((source) => {
            newSources.set(source.id, {
              type: getSourceTypeFromSourceID(source.id),
              source,
            });
          });
          resolve(newSources);
        } catch (e) {
          reject();
        }
      }
    );
  }

  async refreshDesktopCapturerSources() {
    // TODO: implement get available sources logic here;
    try {
      await this.updateDesktopCapturerSources();
      // eslint-disable-next-line promise/always-return
      // eventually run checkers that emit events
      this.checkForClosedWindows();
      this.checkForScreensDisconnected();
    } catch (e) {
      this.log.error(e);
    }
  }

  startPollForInactiveListenersLoop() {
    setInterval(() => {
      // TODO: implement logic
      // if session ID no longer exists in SharingSessionsService -> remove its listener object
    }, 1000 * 60 * 60); // runs every hour in infinite loop
  }

  checkForClosedWindows() {
    // TODO: implement logic
    // const isSomeWindowsClosed = false;
    // const closedWindowsIDs: string[] = [];
    // if (isSomeWindowsClosed) {
    //   this.notifyOnWindowsClosedListeners(closedWindowsIDs);
    // }
  }

  notifyOnWindowsClosedListeners(_closedWindowsIDs: string[]) {
    // TODO: implement logic
  }

  checkForScreensDisconnected() {
    // TODO: implement logic
    // const isSomeScreensDisconnected = false;
    // const disconnectedScreensIDs: string[] = [];
    // if (isSomeScreensDisconnected) {
    //   this.notifyOnScreensDisconnectedListeners(disconnectedScreensIDs);
    // }
  }

  notifyOnScreensDisconnectedListeners(_disconnectedScreensIDs: string[]) {
    // TODO: implement logic
  }
}

export default DesktopCapturerSourcesService;
