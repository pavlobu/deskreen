import React, { useContext } from 'react';
import { Icon } from '@blueprintjs/core';
import { Col, Row } from 'react-flexbox-grid';
import PropagateLoader from 'react-spinners/PropagateLoader';
import { AppContext } from '../../providers/AppContextProvider';

const Fade = require('react-reveal/Fade');

interface SelectSharingIconProps {
  loadingSharingIconType: LoadingSharingIconType;
  isShownLoadingSharingIcon: boolean;
}

function LoadingSharingIcon(props: SelectSharingIconProps) {
  const { isDarkTheme } = useContext(AppContext);

  const {
    loadingSharingIconType: selectingSharingIconType,
    isShownLoadingSharingIcon: isShownSelectingSharingIcon,
  } = props;

  return (
    <Row
      center="xs"
      top="xs"
      style={{
        height: '100%',
        width: '100%',
        marginRight: '0px',
        marginLeft: '0px',
      }}
    >
      <Col>
        <Row
          style={{
            width: '100%',
            height: '50px',
          }}
          center="xs"
        >
          <Col xs={8} md={4}>
            <PropagateLoader
              loading
              size={18}
              color={isDarkTheme ? '#BFCCD6' : '#5C7080'}
            />
          </Col>
        </Row>
        <Row center="xs">
          <Col>
            <Fade opposite when={isShownSelectingSharingIcon} duration={500}>
              <Icon
                icon={selectingSharingIconType}
                iconSize={60}
                color={isDarkTheme ? '#BFCCD6' : '#5C7080'}
              />
            </Fade>
          </Col>
        </Row>
      </Col>
    </Row>
  );
}

export default LoadingSharingIcon;
