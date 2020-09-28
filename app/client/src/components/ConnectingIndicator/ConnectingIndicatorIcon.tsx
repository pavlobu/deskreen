import React from 'react';
import { Icon } from '@blueprintjs/core';
import { Col, Row } from 'react-flexbox-grid';

interface ConnectingIndicatorIconProps {
  connectionIconType: "feed" | "feed-subscribed";
}

function ConnectingIndicatorIcon(props: ConnectingIndicatorIconProps) {
  const { connectionIconType } = props;

  return (
    <Row
    middle="xs"
    center="xs"
    style={{
      height: '100%',
      width: '100%',
    }}
  >
    <Col>
      <Icon
        icon={connectionIconType}
        iconSize={50}
        color="white"
        style={{
          transform: 'translateX(10px)',
        }}
      />
    </Col>
  </Row>
  );
}

export default ConnectingIndicatorIcon;
