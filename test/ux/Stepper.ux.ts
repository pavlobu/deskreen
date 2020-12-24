/* eslint jest/expect-expect: off, jest/no-test-callback: off */
import { ClientFunction, Selector } from 'testcafe';

const getPageTitle = ClientFunction(() => document.title);
const assertNoConsoleErrors = async (t) => {
  const { error } = await t.getBrowserConsoleMessages();
  await t.expect(error).eql([]);
};

// TODO: fix this test. there should be no console log errors after each thest!
fixture`Main App UX Test`
  .page('../../app/app.html')
  .afterEach(assertNoConsoleErrors)
  .beforeEach(async (t) => {
    // eslint-disable-next-line no-restricted-globals
    await t.eval(() => location.reload());
  });

// Deskreen selectors
const connectTestDeviceButton = Selector('button').withText(
  'Connect Test Device'
);
const allowToConnectButton = Selector('button').withText('Allow');
const denyToConnectButton = Selector('button').withText('Deny');
const shareEntireScreenButton = Selector('button').withText('Entire Screen');
const shareApplicationWindowButton = Selector('button').withText(
  'Application Window'
);
const magnifyQRCodeButton = Selector('#magnify-qr-code-button');
const largeQRCodeDialog = Selector('#qr-code-dialog-inner');
const connectedInfoStepperButton = Selector(
  '#connected-device-info-stepper-button'
);
const deviceInfoCallout = Selector('#device-info-callout');
const disconnectOneDeviceButton = Selector('button').withExactText(
  'Disconnect'
);
const disconnectAllDevicesButton = Selector('button').withText(
  'Disconnect all'
);
const reactToastNotificationsContainer = Selector(
  '.react-toast-notifications__container'
);
const headerWithTextSelectEntireScreen = Selector('h3').withText(
  'Select Entire Screen to Share'
);
const headerWithTextSelectAppWindow = Selector('h3').withText(
  'Select App Window to Share'
);
const previewShareButton = Selector('.preview-share-thumb-container');
const step3ConfirmButton = Selector('button').withText('Confirm');
const noINeedToShareOtherThingButton = Selector('button').withText(
  'No, I need to share other thing'
);
const step4ConnectNewDeviceButton = Selector('button').withText(
  'Connect New Device'
);
const connectedDevicesButton = Selector(
  '#top-panel-connected-devices-list-button'
);
const connectedDevicesHeader = Selector('.bp3-text-muted').withText(
  'Connected Devices'
);
const getdeviceIPContainerByIP = (ip) =>
  Selector('.device-ip-span').withText(ip);
const yesDisconnectAllButton = Selector('button').withText(
  'Yes, Disconnect All'
);
const settingsButtonOfTopPanel = Selector('span').withAttribute('icon', 'cog');
const openedSettingsOverlay = Selector('#settings-overlay-inner');
const darkColorAppSettingButton = Selector('button').withText('Dark');
const lightColorAppSettingButton = Selector('button').withText('Light');
const darkUIClassName = Selector('.bp3-dark');

async function getConnecteddeviceIPFromAllowToConnectDeviceAlert() {
  const deviceIPTextElement = Selector('.device-ip-span');
  const textWithIp = await deviceIPTextElement.innerText;
  return textWithIp.trim();
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function connectTestDeviceAndGetIP(t) {
  await t.click(connectTestDeviceButton());
  return getConnecteddeviceIPFromAllowToConnectDeviceAlert();
}

async function connectTestDevice(t) {
  await t.click(connectTestDeviceButton());
}

async function connectAndAllowTestDeviceAndGetIP(t) {
  await connectTestDevice(t);
  const ip = getConnecteddeviceIPFromAllowToConnectDeviceAlert();
  await t.click(allowToConnectButton());
  return ip;
}

async function connectAndAllowTestDevice(t) {
  await connectTestDevice(t);
  await t.click(allowToConnectButton());
}

async function openLargeQRCodeDialog(t) {
  await t.click(magnifyQRCodeButton());
}

async function clickOnLargeQRCodeDialog(t) {
  await t.click(largeQRCodeDialog());
}

async function openConnectedDeviceInfoPopover(t) {
  await t.click(connectedInfoStepperButton());
}

async function goToStep3SharingEntireScreen(t) {
  await connectAndAllowTestDevice(t);
  await t.click(shareEntireScreenButton());
  await t.click(previewShareButton());
}

async function goToStep3SharingAppWindow(t) {
  await connectAndAllowTestDevice(t);
  await t.click(shareApplicationWindowButton());
  await t.click(previewShareButton());
}

async function goToStep4SharingAppWindow(t) {
  await goToStep3SharingAppWindow(t);
  await t.click(step3ConfirmButton());
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function goToStep4SharingEntireScreen(t) {
  await goToStep3SharingEntireScreen(t);
  await t.click(step3ConfirmButton());
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function connectDeviceSharingAppWindow(t) {
  await goToStep4SharingAppWindow(t);
}

async function connectDeviceSharingAppWindowAndGetIP(t) {
  const ip = await connectAndAllowTestDeviceAndGetIP(t);
  await t.click(shareApplicationWindowButton());
  await t.click(previewShareButton());
  await t.click(step3ConfirmButton());
  await t.click(step4ConnectNewDeviceButton());
  return ip;
}

async function connectDeviceSharingEntireScreenAndGetIP(t) {
  const ip = await connectAndAllowTestDeviceAndGetIP(t);
  await t.click(shareEntireScreenButton());
  await t.click(previewShareButton());
  await t.click(step3ConfirmButton());
  await t.click(step4ConnectNewDeviceButton());
  return ip;
}

async function openConnectedDevicesListDrawer(t) {
  await t.click(connectedDevicesButton());
}

test(`when app is launched,

  it should have correct app title as "Deskreen"`, async (t) => {
  await t.expect(getPageTitle()).eql('Deskreen');
});

test(`when on Scan QR code step (step 1),
  and when device is connected,
  and when user pressed "Deny" button

  it should close alert with Allow or Deny buttons`, async (t) => {
  await t.hover(magnifyQRCodeButton());
  await t.hover(connectTestDeviceButton());

  await t.hover(connectTestDeviceButton());
  await t.click(connectTestDeviceButton());

  const allowButtonExists = Selector('.class-allow-device-to-connect-alert')
    .child('button')
    .withText('Allow')().exists;
  const denyButtonExists = Selector('.class-allow-device-to-connect-alert')
    .child('button')
    .withText('Deny')().exists;
  await t.expect(allowButtonExists).notOk();
  await t.expect(denyButtonExists).notOk();
});

test(`when on Scan QR code step (step 1),
  and when device is connected,

  it should show alert with Allow or Deny buttons`, async (t) => {
  await t.hover(magnifyQRCodeButton());
  await t.hover(connectTestDeviceButton());

  await t.hover(connectTestDeviceButton());

  await t.click(connectTestDeviceButton());

  const allowButtonExists = allowToConnectButton().exists;
  const denyButtonExists = denyToConnectButton().exists;

  await t.expect(allowButtonExists).ok();
  await t.expect(denyButtonExists).ok();
});

test(`when on Scan QR code step (step 1),
  and when device is connected,
  and when user pressed "Allow" button,

  it should go to "Share App or Screen" step (step 2)`, async (t) => {
  await connectAndAllowTestDeviceAndGetIP(t);

  const EntireScreenButtonExists = shareEntireScreenButton().exists;
  const AppWindoScreenButtonExists = shareApplicationWindowButton().exists;
  await t.expect(EntireScreenButtonExists).ok();
  await t.expect(AppWindoScreenButtonExists).ok();
});

test(`when on Scan QR code step (step 1),
  and when "Magnify QR code" button is clicked,

  it should open large QR code overflow`, async (t) => {
  await openLargeQRCodeDialog(t);

  const largeQRCodeDialogExists = largeQRCodeDialog().exists;
  await t.expect(largeQRCodeDialogExists).ok();
});

test(`when large QR overflow is opened,
  and when user clicks cross button,

  it should close large QR code overflow`, async (t) => {
  await openLargeQRCodeDialog(t);
  await clickOnLargeQRCodeDialog(t);

  const largeQrCodeDialogExists = largeQRCodeDialog().exists;
  await t.expect(largeQrCodeDialogExists).notOk();
});

test(`when on step 2,
  and when device is connected,

  it should show Connected (info) button in UI`, async (t) => {
  await connectAndAllowTestDeviceAndGetIP(t);
  const connectedInfoStepperButtonExists = connectedInfoStepperButton().exists;

  await t.expect(connectedInfoStepperButtonExists).ok();
});

test(`when on step 2,
  and when device is connected,
  and when user clicked Connected (info) button of stepper panel,

  it should show connected device popover with IP of connected device`, async (t) => {
  const ip = await connectAndAllowTestDeviceAndGetIP(t);
  await openConnectedDeviceInfoPopover(t);

  const textWithIp = await deviceInfoCallout().innerText;
  await t.expect(textWithIp.includes(ip)).ok();
});

test(`when on step 2,
  and when user Clicks "Disconnect" button of
  Connected (info) popover,

  it should go back to Scan QR code step 1`, async (t) => {
  await connectAndAllowTestDeviceAndGetIP(t);
  await openConnectedDeviceInfoPopover(t);
  await t.click(disconnectOneDeviceButton());

  const magnifyQRCodeButtonExists = magnifyQRCodeButton().exists;
  await t.expect(magnifyQRCodeButtonExists).ok();
});

test(`when on step 2,
  and when user Clicks "Disconnect" button of
  Connected (info) popover,

  it should display react toast notification that device has been disconnected`, async (t) => {
  await connectAndAllowTestDeviceAndGetIP(t);
  await openConnectedDeviceInfoPopover(t);
  await t.click(disconnectOneDeviceButton());

  const toastText = await reactToastNotificationsContainer().innerText;
  await t.expect(toastText !== '').ok();
});

test(`when on step 2,
  and when user clicks "Share Entire Screen" button,

  it should display "Select Entire Screen to Share" overlay`, async (t) => {
  await connectAndAllowTestDeviceAndGetIP(t);
  await t.click(shareEntireScreenButton());

  const headerWithTextSelectEntireScreenExists = headerWithTextSelectEntireScreen()
    .exists;
  await t.expect(headerWithTextSelectEntireScreenExists).ok();
});

test(`when on step 2,
  and when user clicks "Share Application Window" button,

  it should display "Select App Window to Share" overlay`, async (t) => {
  await connectAndAllowTestDeviceAndGetIP(t);
  await t.click(shareApplicationWindowButton());

  const headerWithTextSelectAppWindowExists = headerWithTextSelectAppWindow()
    .exists;
  await t.expect(headerWithTextSelectAppWindowExists).ok();
});

test(`when on step 2,
  and when user clicks "Share Entire Screen" button,
  and when user clicks on previev button,

  it should go to step 3 and display a "Confirm" button`, async (t) => {
  await goToStep3SharingEntireScreen(t);

  const step3ConfirmButtonExists = step3ConfirmButton().exists;
  await t.expect(step3ConfirmButtonExists).ok();
});

test(`when on step 2,
  and when user clicks "Share Application Window" button,
  and when user clicks on previev button,

  it should go to step 3 and display a "Confirm" button`, async (t) => {
  await goToStep3SharingAppWindow(t);

  const step3ConfirmButtonExists = step3ConfirmButton().exists;
  await t.expect(step3ConfirmButtonExists).ok();
});

test(`when on step 3,
  and when user clicks "No, I need to share other thing" button,

  it should go back to step 2 and display a OR button group`, async (t) => {
  await goToStep3SharingAppWindow(t);
  await t.click(noINeedToShareOtherThingButton());

  const EntireScreenButtonExists = shareEntireScreenButton().exists;
  const AppWindoScreenButtonExists = shareApplicationWindowButton().exists;
  await t.expect(EntireScreenButtonExists).ok();
  await t.expect(AppWindoScreenButtonExists).ok();
});

test(`when on step 3,
  and when user clicks "Confirm" button,

  it should go back to step 4 (Success Step) and display a "Connect New Device" button`, async (t) => {
  await goToStep3SharingAppWindow(t);
  await t.click(step3ConfirmButton());

  const ConnectNewDeviceButtonExists = step4ConnectNewDeviceButton().exists;
  await t.expect(ConnectNewDeviceButtonExists).ok();
});

test(`when on step 4 (Success Step),
  and when user clicks "Connect New Device" button,

  it should go back to step 1 and display a QR code`, async (t) => {
  await goToStep4SharingAppWindow(t);
  await t.click(step4ConnectNewDeviceButton());

  const MagnifyQRCodeButtonExists = magnifyQRCodeButton().exists;
  await t.expect(MagnifyQRCodeButtonExists).ok();
});

test(`when device is connected,
  and when "Connected Devices List" drawer is opened",

  it should open "Connected Devices List" panel`, async (t) => {
  // await connectDeviceSharingAppWindow(t);
  await goToStep4SharingAppWindow(t);
  await t.click(connectedDevicesButton());

  const ConnectedDevicesHeaderExists = connectedDevicesHeader().exists;
  await t.expect(ConnectedDevicesHeaderExists).ok();
});

test(`when on step 4 (Success Step),
  and when user clicks "Connected Devices" button,

  it should open "Connected Devices List" panel with a connected device listed in it`, async (t) => {
  const ip = await connectDeviceSharingAppWindowAndGetIP(t);
  await openConnectedDevicesListDrawer(t);

  await t.expect(getdeviceIPContainerByIP(ip).exists).ok();
});

test(`when multiple devices are connected,
  and when user clicks "Connected Devices" button,
  and when "Connected Devices List" drawer is opened,

  it should list all connected devices with IPs in "Connected Devices List" drawer`, async (t) => {
  const ipOne = await connectDeviceSharingAppWindowAndGetIP(t);
  const ipTwo = await connectDeviceSharingAppWindowAndGetIP(t);
  const ipThree = await connectDeviceSharingEntireScreenAndGetIP(t);
  const ipFour = await connectDeviceSharingEntireScreenAndGetIP(t);

  await openConnectedDevicesListDrawer(t);

  await t.expect(getdeviceIPContainerByIP(ipOne).exists).ok();
  await t.expect(getdeviceIPContainerByIP(ipTwo).exists).ok();
  await t.expect(getdeviceIPContainerByIP(ipThree).exists).ok();
  await t.expect(getdeviceIPContainerByIP(ipFour).exists).ok();
});

test(`when device is connected,
  and when "Connected Devices List" drawer is opened,
  and when user clicks "Disconnect" button of just connected device,

  it should remove a device from connected devices list drawer`, async (t) => {
  // for some reason this test is flacky when we do Disconnect button click
  // eslint-disable-next-line no-restricted-globals
  await t.eval(() => location.reload());

  const ip = await connectDeviceSharingAppWindowAndGetIP(t);
  await openConnectedDevicesListDrawer(t);

  await t.hover(Selector('button').withExactText('Disconnect'));
  await t.click(Selector('button').withExactText('Disconnect'));

  await t.expect(getdeviceIPContainerByIP(ip).exists).notOk();
});

test(`when multiple devices are connected,
  and when "Connected Devices List" drawer is opened,
  and when user clicked "Disconnect all" button,
  and when user clicked "Yes, Disconnect All" button in alert,
  and when "Connected Devices List" drawer is opened again,

  it should remove remove all devices from "Connected Devices List" drawer`, async (t) => {
  const ipOne = await connectDeviceSharingAppWindowAndGetIP(t);
  const ipTwo = await connectDeviceSharingAppWindowAndGetIP(t);
  const ipThree = await connectDeviceSharingEntireScreenAndGetIP(t);
  const ipFour = await connectDeviceSharingEntireScreenAndGetIP(t);
  await openConnectedDevicesListDrawer(t);
  await t.click(disconnectAllDevicesButton());
  await t.click(yesDisconnectAllButton());

  await openConnectedDevicesListDrawer(t);

  await t.expect(getdeviceIPContainerByIP(ipOne).exists).notOk();
  await t.expect(getdeviceIPContainerByIP(ipTwo).exists).notOk();
  await t.expect(getdeviceIPContainerByIP(ipThree).exists).notOk();
  await t.expect(getdeviceIPContainerByIP(ipFour).exists).notOk();
});

test(`when device is connected,
  and when user is on "Success" step, (step 4),
  and when "Connected Devices List" drawer is opened,
  and when user clicked "Disconnect all" button,
  and when user clicked "Yes, Disconnect All" in alert,

  it should go back to Scan QR code step`, async (t) => {
  await goToStep4SharingAppWindow(t);
  await openConnectedDevicesListDrawer(t);
  await t.click(disconnectAllDevicesButton());
  await t.click(yesDisconnectAllButton());

  await t.expect(magnifyQRCodeButton().exists).ok();
});

test(`when device is connected,
  and when user clicks "Connected Devices List" drawer is opened,
  and when user clicks "Disconnect all" button of connected device

  it should display "Are you sure you want to disconnect all devices..." alert`, async (t) => {
  await connectDeviceSharingAppWindowAndGetIP(t);
  await openConnectedDevicesListDrawer(t);
  await t.click(Selector('button').withText('Disconnect all'));

  await t.expect(yesDisconnectAllButton().exists).ok();
});

test(`when clicks "Settings" button of top panel,

  it should open "Settings" panel`, async (t) => {
  await t.click(settingsButtonOfTopPanel());

  await t.expect(openedSettingsOverlay().exists).ok();
});

test(`when "Settings" Panel is opened,
  and when user clicks "Dark" and "Light" buttons,

  it should change application colors accordingly`, async (t) => {
  await t.click(settingsButtonOfTopPanel());

  // action and assertion 1
  await t.click(darkColorAppSettingButton());
  await t.expect(darkUIClassName().exists).ok();

  // action and assertion 2
  await t.click(lightColorAppSettingButton());
  await t.expect(darkUIClassName().exists).notOk();
});
