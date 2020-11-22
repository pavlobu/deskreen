import React, { useContext } from 'react';
import { Callout, Card, H3, Text, Tooltip, Position } from '@blueprintjs/core';
import { AppContext } from '../../providers/AppContextProvider';

const LIGHT_UI_BACKGROUND = 'rgba(240, 248, 250, 1)';
const DARK_UI_BACKGROUND = '#293742';

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
          content="This should match with 'Device IP' in alert displayed on your computer, where Deskreen is running."
          position={Position.TOP}
        >
          <div style={{ fontWeight: 900, backgroundColor: '#00f99273' }}>
            <Text>Device IP: {myIP}</Text>
          </div>
        </Tooltip>
        <Text>Device Browser: {myBrowser}</Text>
        <Text>Device OS: {myOS}</Text>
      </Callout>
      <Text className="bp3-text-muted">
        These details should match with the ones that you see in alert on
        sharing device.
      </Text>
    </Card>
  );
}

export default MyDeviceInfoCard;
