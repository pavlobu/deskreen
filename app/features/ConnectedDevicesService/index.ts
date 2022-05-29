export const nullDevice: Device = {
  id: '',
  sharingSessionID: '',
  deviceOS: '',
  deviceType: '',
  deviceIP: '',
  deviceBrowser: '',
  deviceScreenWidth: -1,
  deviceScreenHeight: -1,
};

class ConnectedDevices {
  devices: Device[] = [];

  pendingConnectionDevice: Device = nullDevice;

  resetPendingConnectionDevice() {
    this.pendingConnectionDevice = nullDevice;
  }

  getDevices() {
    return this.devices;
  }

  disconnectAllDevices() {
    this.devices = [] as Device[];
  }

  disconnectDeviceByID(deviceIDToRemove: string) {
    return new Promise<undefined>((resolve) => {
      this.devices = this.devices.filter((d) => {
        return d.id !== deviceIDToRemove;
      });
      resolve(undefined);
    });
  }

  addDevice(device: Device) {
    this.devices.push(device);
  }

  setPendingConnectionDevice(device: Device) {
    this.pendingConnectionDevice = device;
  }
}

export default ConnectedDevices;
