import React from 'react';
import { Row, Col } from 'react-flexbox-grid';
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
