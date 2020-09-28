import { UAParser } from 'ua-parser-js';

export function getOSFromUAParser(uaParser: UAParser) {
  const osFromUAParser = uaParser.getResult().os;

  return `${osFromUAParser.name ? osFromUAParser.name : ''} ${
      osFromUAParser.version ? osFromUAParser.version : ''
    }`;
}

export function getDeviceTypeFromUAParser(uaParser: UAParser) {
  const deviceTypeFromUAParser = uaParser.getResult().device;

  return deviceTypeFromUAParser.type
  ? deviceTypeFromUAParser.type.toString()
  : 'computer'
}

export function getBrowserFromUAParser(uaParser: UAParser) {
  const browserFromUAParser = uaParser.getResult().browser;

  return `${browserFromUAParser.name ? browserFromUAParser.name : ''} ${
      browserFromUAParser.version ? browserFromUAParser.version : ''
    }`;
}
