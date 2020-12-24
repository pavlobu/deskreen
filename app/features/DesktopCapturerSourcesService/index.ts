/* eslint-disable no-async-promise-executor */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable class-methods-use-this */
import { desktopCapturer, DesktopCapturerSource } from 'electron';
import Logger from '../../utils/LoggerWithFilePrefix';
import DesktopCapturerSourceType from './DesktopCapturerSourceType';

const log = new Logger(__filename);

const getSourceTypeFromSourceID = (id: string): DesktopCapturerSourceType => {
  if (id.includes('screen')) {
    return DesktopCapturerSourceType.SCREEN;
  }
  return DesktopCapturerSourceType.WINDOW;
};

type DesktopCapturerSourceWithType = {
  type: DesktopCapturerSourceType;
  source: DesktopCapturerSource;
};
type SourcesDisappearListener = (ids: string[]) => void;
type SharingSessionID = string;

class DesktopCapturerSources {
  sources: Map<string, DesktopCapturerSourceWithType>;

  lastAvailableScreenIDs: string[];

  lastAvailableWindowIDs: string[];

  onWindowClosedListeners: Map<SharingSessionID, SourcesDisappearListener[]>;

  onScreenDisconnectedListeners: Map<
    SharingSessionID,
    SourcesDisappearListener[]
  >;

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

    setTimeout(() => {
      setInterval(() => {
        this.refreshDesktopCapturerSources();
      }, 5000);
    }, 4000);
    this.pollForInactiveListeners();
  }

  getSourcesMap(): Map<string, DesktopCapturerSourceWithType> {
    return this.sources;
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

  getSourceDisplayIDBySourceID(sourceID: string) {
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

  private async updateDesktopCapturerSources() {
    this.lastAvailableScreenIDs = [];
    this.lastAvailableWindowIDs = [];

    [...this.sources.keys()].forEach((key) => {
      const oldSource = this.sources.get(key);
      if (!oldSource) return;
      if (oldSource.type === DesktopCapturerSourceType.WINDOW) {
        this.lastAvailableWindowIDs.push(oldSource.source.id);
      } else if (oldSource.type === DesktopCapturerSourceType.SCREEN) {
        this.lastAvailableScreenIDs.push(oldSource.source.id);
      }
    });

    this.sources = await this.getDesktopCapturerSources();
  }

  // eslint-disable-next-line class-methods-use-this
  private getDesktopCapturerSources(): Promise<
    Map<string, DesktopCapturerSourceWithType>
  > {
    return new Promise<Map<string, DesktopCapturerSourceWithType>>(
      async (resolve, reject) => {
        const newSources = new Map<string, DesktopCapturerSourceWithType>();
        try {
          const capturerSources = await desktopCapturer.getSources({
            types: ['window', 'screen'],
            thumbnailSize: { width: 500, height: 500 },
            fetchWindowIcons: true, // TODO: use window icons in app UI !
          });
          // for (const source of capturerSources) {
          //   newSources.set(source.id, {
          //     type: getSourceTypeFromSourceID(source.id),
          //     source,
          //   });
          // }

          capturerSources.forEach((source) => {
            newSources.set(source.id, {
              type: getSourceTypeFromSourceID(source.id),
              source,
            });
          });
          // .catch((e) => {
          //   console.error(e);
          //   throw new Error('error getting desktopCapturer sources');
          // });
          resolve(newSources);
        } catch (e) {
          reject();
        }
      }
    );
  }

  private refreshDesktopCapturerSources() {
    // TODO: implement get available sources logic here;
    this.updateDesktopCapturerSources()
      // eslint-disable-next-line promise/always-return
      .then(() => {
        // eventually run checkers that emit events
        this.checkForClosedWindows();
        this.checkForScreensDisconnected();
      })
      .catch((e) => {
        log.error(e);
      });
  }

  private pollForInactiveListeners() {
    // TODO: implement logic
    // if session ID no longer exists in SharingSessionsService -> remove its listener object

    setTimeout(() => {
      this.pollForInactiveListeners();
    }, 1000 * 60 * 60); // runs every hour in infinite loop
  }

  private checkForClosedWindows() {
    // TODO: implement logic
    const isSomeWindowsClosed = false;
    const closedWindowsIDs: string[] = [];

    if (isSomeWindowsClosed) {
      this.notifyOnWindowsClosedListeners(closedWindowsIDs);
    }
  }

  private notifyOnWindowsClosedListeners(_closedWindowsIDs: string[]) {
    // TODO: implement logic
  }

  private checkForScreensDisconnected() {
    // TODO: implement logic
    const isSomeScreensDisconnected = false;
    const disconnectedScreensIDs: string[] = [];

    if (isSomeScreensDisconnected) {
      this.notifyOnScreensDisconnectedListeners(disconnectedScreensIDs);
    }
  }

  private notifyOnScreensDisconnectedListeners(
    _disconnectedScreensIDs: string[]
  ) {
    // TODO: implement logic
  }
}

export default DesktopCapturerSources;
