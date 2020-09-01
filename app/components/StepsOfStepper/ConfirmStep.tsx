/* eslint-disable react/jsx-curly-brace-presence */
/* eslint-disable react/destructuring-assignment */
import React from 'react';
import { Text, Card } from '@blueprintjs/core';

interface ConfirmStepProps {
  device: Device | null;
}

export default function ConfirmStep(props: ConfirmStepProps) {
  return (
    <>
      <div style={{ marginBottom: '10px' }}>
        <Text>{`Check if all is OK and click "Confirm"`}</Text>
      </div>

      <Card style={{ marginBottom: '10px' }}>
        <Text>{`Device: ${props.device?.deviceType}`}</Text>
        <Text>{`Device IP: ${props.device?.deviceIp}`}</Text>
        <Text>{`Device OS: ${props.device?.deviceOs}`}</Text>
        <Text>{`Session ID: ${props.device?.sessionId}`}</Text>
      </Card>
      <div style={{ marginBottom: '10px' }}>
        <Text className="bp3-text-muted">
          {`Click "Back" if you need to change something`}
        </Text>
      </div>
    </>
  );
}
