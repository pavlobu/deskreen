/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import React from 'react';
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import ScanQRStep from './ScanQRStep';

Enzyme.configure({ adapter: new Adapter() });
jest.useFakeTimers();

const bp3QRCodeDialogRootSelector = '#bp3-qr-code-dialog-root';
const magnifyQRCodeButtonSelector = '#magnify-qr-code-button';
const qrCodeDialogInnerSelector = '#qr-code-dialog-inner';

describe('<ScanQRStep />', () => {
  let wrapper = Enzyme.shallow(<ScanQRStep />);

  beforeEach(() => {
    wrapper = Enzyme.shallow(<ScanQRStep />);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('when user clicks on magnify QR code button', () => {
    it('should set "QR Code Dialog Root" isOpen property to "true"', () => {
      // @ts-ignore
      wrapper.find(magnifyQRCodeButtonSelector).props().onClick();
      // @ts-ignore
      expect(wrapper.find(bp3QRCodeDialogRootSelector).props().isOpen).toBe(
        true
      );
    });
  });

  describe(`when magnified QR code dialog is opened,
  and when user closes magnified QR code dialog`, () => {
    it('should set "QR Code Dialog Root" isOpen property to "false"', () => {
      // @ts-ignore
      wrapper.find(magnifyQRCodeButtonSelector).props().onClick();
      // @ts-ignore
      wrapper.find(bp3QRCodeDialogRootSelector).props().onClose();
      // @ts-ignore
      expect(wrapper.find(bp3QRCodeDialogRootSelector).props().isOpen).toBe(
        false
      );
    });
  });

  describe(`when magnified QR code dialog is opened,
  and when user clicks on qr code dialog inner`, () => {
    it('should set "QR Code Dialog Root" isOpen property to "false"', () => {
      // @ts-ignore
      wrapper.find(magnifyQRCodeButtonSelector).props().onClick();
      // @ts-ignore
      wrapper.find(qrCodeDialogInnerSelector).props().onClick();
      // @ts-ignore
      expect(wrapper.find(bp3QRCodeDialogRootSelector).props().isOpen).toBe(
        false
      );
    });
  });
});
