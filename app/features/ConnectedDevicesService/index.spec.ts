import ConnectedDevicesService, { nullDevice } from '.';

jest.useFakeTimers();

const testDevice = {
  id: '112112112',
  sharingSessionID: '12332',
  deviceOS: '4123',
  deviceType: '43',
  deviceIP: '1234',
  deviceBrowser: '41234',
  deviceScreenWidth: 200,
  deviceScreenHeight: 300,
};

describe('ConnectedDevicesService tests', () => {
  let service: ConnectedDevicesService;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();

    service = new ConnectedDevicesService();
  });

  describe('when ConnectedDevicesService created properly', () => {
    describe('when .resetPendingConnectionDevice() was called', () => {
      it('should set .pendingConnectionDevice to nullDevice', () => {
        service.pendingConnectionDevice = testDevice;
        service.resetPendingConnectionDevice();

        expect(service.pendingConnectionDevice).toBe(nullDevice);
      });
    });

    describe('when .getDevices() was called', () => {
      it('should return .devices array', () => {
        const res = service.getDevices();

        expect(res).toBe(service.devices);
      });
    });

    describe('when .removeAllDevices() was called', () => {
      it('should make .devices array empty', () => {
        service.devices.push(testDevice);

        service.removeAllDevices();

        expect(service.devices.length).toBe(0);
      });
    });

    describe('when .removeDeviceByID() was called', () => {
      it('should remove appropriate device from .devices array', async () => {
        const testDevice2 = (JSON.parse(
          JSON.stringify(testDevice)
        ) as unknown) as Device;
        service.devices.push(testDevice);
        service.devices.push(testDevice2);

        await service.removeDeviceByID(testDevice.id);

        let isStillInArray = false;
        service.devices.forEach((d) => {
          if (d.id === testDevice.id) {
            isStillInArray = true;
          }
        });
        expect(isStillInArray).toBe(false);
      });
    });

    describe('when .addDevice() was called', () => {
      it('should add device to .devices array', () => {
        service.addDevice(testDevice);

        let isInArray = false;
        service.devices.forEach((d) => {
          if (d.id === testDevice.id) {
            isInArray = true;
          }
        });
        expect(isInArray).toBe(true);
      });
    });

    describe('when .addPendingConnectedDeviceListener() was called', () => {
      it('should add listener to .pendingDeviceConnectedListeners array', () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const testCallback = (_: Device) => {};

        service.addPendingConnectedDeviceListener(testCallback);

        let isInArray = false;
        service.pendingDeviceConnectedListeners.forEach((c) => {
          if (c === testCallback) {
            isInArray = true;
          }
        });
        expect(isInArray).toBe(true);
      });
    });

    describe('when .setPendingConnectionDevice() was called', () => {
      it('should set passed device as pendingConnectionDevice adn call .emitPendingConnectionDeviceConnected', () => {
        service.emitPendingConnectionDeviceConnected = jest.fn();

        service.setPendingConnectionDevice(testDevice);

        expect(service.pendingConnectionDevice).toBe(testDevice);
        expect(service.emitPendingConnectionDeviceConnected).toBeCalled();
      });
    });

    describe('when .emitPendingConnectionDeviceConnected() was called', () => {
      it('should call all callbacks in pendingDeviceConnectedListeners', () => {
        const testCallback1 = jest.fn();
        const testCallback2 = jest.fn();
        service.pendingDeviceConnectedListeners = [
          testCallback1,
          testCallback2,
        ];

        service.emitPendingConnectionDeviceConnected();

        expect(testCallback1).toBeCalled();
        expect(testCallback2).toBeCalled();
      });
    });
  });
});
