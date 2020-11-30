import React, { useContext } from 'react';
import { Callout, Card, H3, Text, Tooltip, Position } from '@blueprintjs/core';
import { AppContext } from '../../providers/AppContextProvider';
import {
  DARK_UI_BACKGROUND,
  LIGHT_UI_BACKGROUND,
} from '../../constants/styleConstants';

interface MyDeviceDetailsCardProps {
  deviceDetails: DeviceDetails;
}

function MyDeviceInfoCard(props: MyDeviceDetailsCardProps) {
  const { isDarkTheme } = useContext(AppContext);

  const { deviceDetails } = props;
  const { myIP, myOS, myDeviceType, myBrowser } = deviceDetails;

  return (
    <Card
      elevation={3}
      style={{
        backgroundColor: isDarkTheme ? DARK_UI_BACKGROUND : LIGHT_UI_BACKGROUND,
        marginBottom: '30px',
      }}
    >
      <H3>My Device Info:</H3>
      <Callout>
        <Text>Device Type: {myDeviceType}</Text>
        <Tooltip
          content="This should match with 'Device IP' in alert popup appeared on your computer, where Deskreen is running."
          position={Position.TOP}
        >
          <div
            style={{
              fontWeight: 900,
              backgroundColor: '#00f99273',
              paddingLeft: '10px',
              paddingRight: '10px',
              borderRadius: '20px',
            }}
          >
            <Text>Device IP: {myIP}</Text>
          </div>
        </Tooltip>
        <Text>Device Browser: {myBrowser}</Text>
        <Text>Device OS: {myOS}</Text>
      </Callout>
      <Text className="bp3-text-muted">
        These details should match with the ones that you see in alert popup on
        screen sharing device.
      </Text>
    </Card>
  );
}

export default MyDeviceInfoCard;
