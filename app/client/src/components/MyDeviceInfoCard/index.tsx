import React, { useContext } from 'react';
import { Callout, Card, H3, Text, Tooltip, Position } from '@blueprintjs/core';
import { useTranslation } from 'react-i18next';
import { AppContext } from '../../providers/AppContextProvider';
import {
  DARK_UI_BACKGROUND,
  LIGHT_UI_BACKGROUND,
} from '../../constants/styleConstants';

interface MyDeviceDetailsCardProps {
  deviceDetails: DeviceDetails;
}

function MyDeviceInfoCard(props: MyDeviceDetailsCardProps) {
  const { t } = useTranslation();
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
      <H3>{`${t('My Device Info')}:`}</H3>
      <Callout>
        <Text>{`${t('Device Type')}: ${myDeviceType}`}</Text>
        <Tooltip
          content={t('Your Device IP should match with Device IP in alert popup appeared on your computer, where Deskreen is running')}
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
            <Text>{`${t('Device IP')}: ${myIP}`}</Text>
          </div>
        </Tooltip>
        <Text>{`${t('Device Browser')}: ${myBrowser}`}</Text>
        <Text>{`${t('Device OS')}: ${myOS}`}</Text>
      </Callout>
      <Text className="bp3-text-muted">
        {t('These details should match with the ones that you see in alert popup on computer screen, where Deskreen is running')}
      </Text>
    </Card>
  );
}

export default MyDeviceInfoCard;
