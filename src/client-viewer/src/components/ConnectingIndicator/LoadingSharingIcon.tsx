import { Icon } from '@blueprintjs/core';
import { Col, Row } from 'react-flexbox-grid';
import PropagateLoader from 'react-spinners/PropagateLoader';

interface SelectSharingIconProps {
  loadingSharingIconType: LoadingSharingIconType;
  isShownLoadingSharingIcon: boolean;
}

function LoadingSharingIcon(props: SelectSharingIconProps) {

  const {
    loadingSharingIconType: selectingSharingIconType,
    isShownLoadingSharingIcon: isShownSelectingSharingIcon,
  } = props;

  return (
    <Row
      center='xs'
      top='xs'
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
          center='xs'
        >
          <Col xs={8} md={4}>
            <PropagateLoader loading size={18} color="#5C7080" />
          </Col>
        </Row>
        <Row center='xs'>
          <Col>
            {isShownSelectingSharingIcon && (
              <Icon
                icon={selectingSharingIconType}
                size={60}
                color="#5C7080"
              />
            )}
          </Col>
        </Row>
      </Col>
    </Row>
  );
}

export default LoadingSharingIcon;
