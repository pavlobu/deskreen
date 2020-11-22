const nullDevice: Device = {
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

  pendingDeviceConnectedListeners: ((device: Device) => void)[] = [];

  resetPendingConnectionDevice() {
    this.pendingConnectionDevice = nullDevice;
  }

  getDevices() {
    return this.devices;
  }

  removeAllDevices() {
    this.devices = [] as Device[];
  }

  removeDeviceByID(deviceIDToRemove: string) {
    return new Promise<undefined>((resolve) => {
      this.devices = this.devices.filter((d) => {
        return d.id !== deviceIDToRemove;
      });
      resolve();
    });
  }

  addDevice(device: Device) {
    this.devices.push(device);
  }

  addPendingConnectedDeviceListener(callback: (device: Device) => void) {
    this.pendingDeviceConnectedListeners.push(callback);
  }

  setPendingConnectionDevice(device: Device) {
    this.pendingConnectionDevice = device;
    this.emitPendingConnectionDeviceConnected();
  }

  private emitPendingConnectionDeviceConnected() {
    this.pendingDeviceConnectedListeners.forEach(
      (callback: (device: Device) => void) => {
        callback(this.pendingConnectionDevice);
      }
    );
  }
}

export default ConnectedDevices;
