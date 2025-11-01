import os from 'os';

const interfacesToCheck = [
  'en0', // macOS Wi-Fi or Ethernet
  'en1', // macOS Wi-Fi or Ethernet
  'awdl0', // macOS peer-to-peer (AirDrop)
  'eth0', // macOS or Linux Ethernet (older setups)
  'bridge100', // macOS bridge (virtual interface)
  'wlan0', // Linux/Android Wi-Fi
  'wlan1', // Linux/Android Wi-Fi
  'wlpXsY', // Linux (newer predictable names for Wi-Fi)
  'eth1', // Linux Ethernet (older setups)
  'enpXsY', // Linux predictable names for Ethernet
  'enxXXXXXX', // Linux Ethernet (based on MAC address)
  'Wi-Fi', // Windows Wi-Fi
  'Wireless Network Connection', // Windows Wi-Fi (older versions)
  'Ethernet', // Windows Ethernet
  'Local Area Connection', // Windows Ethernet (older versions)
  'usb0', // Android/Chrome OS USB Ethernet adapters
];

const interfacesStartsWithCheck = [
  'usb', // Android/Chrome OS USB Ethernet adapters
  'en', // macOS Ethernet interfaces
  'eth', // Linux Ethernet interfaces
  'wlan', // Linux/Android Wi-Fi interfaces
  'wlp', // Linux Wi-Fi interfaces (newer predictable names)
  'enx', // Linux Ethernet based on MAC address
  'Wi-Fi', // Windows Wi-Fi
  'Wireless Network Connection', // Windows Wi-Fi (older versions)
  'Ethernet', // Windows Ethernet
  'Local Area Connection', // Windows Ethernet (older versions)
];

export default function getMyLocalIpV4(): string | undefined {
  // Get network interfaces
  const networkInterfaces = os.networkInterfaces();
  let localIp: string | undefined;
  Object.entries(networkInterfaces).some(([networksKey, networks]) => {
    if (!networks) return false;
    if (networksKey.startsWith('bridge')) return false;
    if (
      !interfacesToCheck.includes(networksKey) &&
      !interfacesStartsWithCheck.some((prefix) => networksKey.startsWith(prefix))
    ) {
      return false;
    }

    return networks.some((network) => {
      if (!network.internal && network.family === 'IPv4') {
        localIp = network.address;
        return true;
      }
      return false;
    });
  });

  return localIp;
}
