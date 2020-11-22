import React from 'react';
import { Row, Col } from 'react-flexbox-grid';
import { Text } from '@blueprintjs/core';
import ShareEntireScreenOrAppWindowControlGroup from '../ShareAppOrScreenControlGroup';

interface ChooseAppOrScreeenStepProps {
  handleNextEntireScreen: () => void;
  handleNextApplicationWindow: () => void;
}

const ChooseAppOrScreeenStep: React.FC<ChooseAppOrScreeenStepProps> = (
  props: ChooseAppOrScreeenStepProps
) => {
  const { handleNextEntireScreen, handleNextApplicationWindow } = props;

  return (
    <Row style={{ width: '100%' }}>
      <Col xs={12}>
        <Row center="xs">
          <Col xs={6}>
            <div style={{ marginBottom: '10px' }}>
              <Text>Choose Entire Screen or App window you want to share</Text>
            </div>
            <Row center="xs">
              <Col>
                <ShareEntireScreenOrAppWindowControlGroup
                  handleNextEntireScreen={handleNextEntireScreen}
                  handleNextApplicationWindow={handleNextApplicationWindow}
                />
              </Col>
            </Row>
          </Col>
        </Row>
      </Col>
    </Row>
  );
};

export default ChooseAppOrScreeenStep;
