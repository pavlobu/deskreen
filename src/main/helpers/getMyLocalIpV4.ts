import os from "os";

// Wi-Fi interface patterns for detection and prioritization
const macosWifiInterfaces = ["en0", "en1"]; // macOS Wi-Fi interfaces (commonly en0, en1, though can also be Ethernet)
const linuxWifiPrefixes = ["wlan", "wlo", "wlp"]; // Linux Wi-Fi interface prefixes
const windowsWifiInterfaces = [
  "Wi-Fi",
  "Wireless LAN adapter Wi-Fi",
  "Wireless LAN adapter",
  "Wireless Network Connection",
  "WLAN",
]; // Windows Wi-Fi interface patterns

export const interfacesToCheck = [
  ...macosWifiInterfaces, // macOS Wi-Fi or Ethernet
  "awdl0", // macOS peer-to-peer (AirDrop)
  "eth0", // macOS or Linux Ethernet (older setups)
  "bridge100", // macOS bridge (virtual interface)
  "wlan0", // Linux/Android Wi-Fi
  "wlan1", // Linux/Android Wi-Fi
  "wlpXsY", // Linux (newer predictable names for Wi-Fi)
  "eth1", // Linux Ethernet (older setups)
  "enpXsY", // Linux predictable names for Ethernet
  "enxXXXXXX", // Linux Ethernet (based on MAC address)
  ...windowsWifiInterfaces, // Windows Wi-Fi
  "Ethernet", // Windows Ethernet
  "Local Area Connection", // Windows Ethernet (older versions)
  "usb0", // Android/Chrome OS USB Ethernet adapters
];

export const interfacesStartsWithCheck = [
  "usb", // Android/Chrome OS USB Ethernet adapters
  "en", // macOS Ethernet interfaces
  "eth", // Linux Ethernet interfaces
  ...linuxWifiPrefixes, // Linux/Android Wi-Fi interfaces
  "enx", // Linux Ethernet based on MAC address
  ...windowsWifiInterfaces, // Windows Wi-Fi
  "Ethernet", // Windows Ethernet
  "Local Area Connection", // Windows Ethernet (older versions)
];

/**
 * Check if an interface name indicates a Wi-Fi interface across all operating systems
 * @param interfaceName - The network interface name to check
 * @returns true if the interface is likely Wi-Fi, false otherwise
 */
function isWifiInterface(interfaceName: string): boolean {
  // Check exact matches for macOS
  if (macosWifiInterfaces.includes(interfaceName)) {
    return true;
  }
  
  // Check if starts with Linux Wi-Fi patterns
  if (linuxWifiPrefixes.some((pattern) => interfaceName.startsWith(pattern))) {
    return true;
  }
  
  // Check if starts with or equals Windows Wi-Fi patterns
  if (
    windowsWifiInterfaces.some((pattern) =>
      interfaceName.startsWith(pattern) || interfaceName === pattern,
    )
  ) {
    return true;
  }
  
  return false;
}

/**
 * Get the active network interface name and its IPv4 address
 * Prioritizes Wi-Fi interfaces across all operating systems
 * @returns Object with interfaceName and ipAddress, or undefined if no valid interface found
 */
export function getActiveNetworkInterface(): { interfaceName: string; ipAddress: string } | undefined {
  // Get network interfaces
  const networkInterfaces = os.networkInterfaces();
  let result: { interfaceName: string; ipAddress: string } | undefined;
  let wifiResult: { interfaceName: string; ipAddress: string } | undefined;
  
  // First pass: collect all valid interfaces, prioritizing Wi-Fi
  Object.entries(networkInterfaces).forEach(([networksKey, networks]) => {
    if (!networks) return;
    if (networksKey.startsWith("bridge")) return;
    if (
      !interfacesToCheck.includes(networksKey) &&
      !interfacesStartsWithCheck.some((prefix) =>
        networksKey.startsWith(prefix),
      )
    ) {
      return;
    }

    networks.forEach((network) => {
      if (!network.internal && network.family === "IPv4") {
        const currentResult = {
          interfaceName: networksKey,
          ipAddress: network.address,
        };
        
        // Prioritize Wi-Fi interfaces
        if (isWifiInterface(networksKey)) {
          if (!wifiResult) {
            wifiResult = currentResult;
          }
        } else {
          // Store non-Wi-Fi interface as fallback
          if (!result) {
            result = currentResult;
          }
        }
      }
    });
  });

  // Return Wi-Fi interface if found, otherwise return fallback
  return wifiResult || result;
}

export default function getMyLocalIpV4(): string | undefined {
  // Get network interfaces
  const networkInterfaces = os.networkInterfaces();
  let localIp: string | undefined;
  let wifiIp: string | undefined;
  
  // First pass: collect all valid interfaces, prioritizing Wi-Fi
  Object.entries(networkInterfaces).forEach(([networksKey, networks]) => {
    if (!networks) return;
    if (networksKey.startsWith("bridge")) return;
    if (
      !interfacesToCheck.includes(networksKey) &&
      !interfacesStartsWithCheck.some((prefix) =>
        networksKey.startsWith(prefix),
      )
    ) {
      return;
    }

    networks.forEach((network) => {
      if (!network.internal && network.family === "IPv4") {
        // Prioritize Wi-Fi interfaces
        if (isWifiInterface(networksKey)) {
          if (!wifiIp) {
            wifiIp = network.address;
          }
        } else {
          // Store non-Wi-Fi interface as fallback
          if (!localIp) {
            localIp = network.address;
          }
        }
      }
    });
  });

  // Return Wi-Fi IP if found, otherwise return fallback
  return wifiIp || localIp;
}
