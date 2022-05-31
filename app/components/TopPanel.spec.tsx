// /* eslint-disable @typescript-eslint/ban-ts-comment */
// import React from 'react';
// import Enzyme, { ShallowWrapper } from 'enzyme';
// import EnzymeToJson from 'enzyme-to-json';
// import Adapter from 'enzyme-adapter-react-16';
// import TopPanel from './TopPanel';

// Enzyme.configure({ adapter: new Adapter() });
// jest.useFakeTimers();

// jest.mock('electron', () => {
//   return {
//     ipcRenderer: {
//       invoke: jest.fn(),
//     },
//     remote: {
//       getGlobal: jest.fn(),
//     },
//   };
// });

// const settingsButtonSelector = '#top-panel-settings-button';
// const connectedDevicesListButtonSelector =
//   '#top-panel-connected-devices-list-button';

// describe('<TopPanel />', () => {
//   let wrapper: ShallowWrapper;

//   beforeEach(() => {
//     wrapper = Enzyme.shallow(<TopPanel />);
//   });

//   afterEach(() => {
//     jest.clearAllMocks();
//   });

//   describe('when Settings button in top panel is clicked', () => {
//     it('should Settings Overlay props isSettingsOpen to true', () => {
//       // @ts-ignore
//       wrapper.find(settingsButtonSelector).props().onClick();
//       // @ts-ignore
//       const settingsOverlay = wrapper.props().children[1];

//       expect(settingsOverlay.props.isSettingsOpen).toBe(true);
//     });
//   });

//   describe('when Settings panel is opened and when its props.handleClose is called', () => {
//     it('should Settings Overlay props isSettingsOpen to false', () => {
//       // @ts-ignore
//       wrapper.find(settingsButtonSelector).props().onClick();
//       // @ts-ignore
//       const settingsOverlay = wrapper.props().children[1];
//       settingsOverlay.props.handleClose();
//       // @ts-ignore
//       const settingsOverlayAfterClose = wrapper.props().children[1];

//       expect(settingsOverlayAfterClose.props.isSettingsOpen).toBe(false);
//     });
//   });

//   describe('when Connected Devices button in top panel is clicked', () => {
//     it('should set Connected Devices List Drawer props isOpen to true', () => {
//       // @ts-ignore
//       wrapper.find(connectedDevicesListButtonSelector).props().onClick();
//       // @ts-ignore
//       const connectedDevicesListDrawer = wrapper.props().children[2];
//       expect(connectedDevicesListDrawer.props.isOpen).toBe(true);
//     });
//   });

//   describe("when Connected Devices List Drawer is opened, and when it's props.handleToggle is called", () => {
//     it('should set Connected Devices List Drawer props isOpen to false', () => {
//       // @ts-ignore
//       wrapper.find(connectedDevicesListButtonSelector).props().onClick();
//       // @ts-ignore
//       const connectedDevicesListDrawer = wrapper.props().children[2];
//       connectedDevicesListDrawer.props.handleToggle();
//       // @ts-ignore
//       const connectedDevicesListDrawerAfter = wrapper.props().children[2];

//       expect(connectedDevicesListDrawerAfter.props.isOpen).toBe(false);
//     });
//   });
// });
