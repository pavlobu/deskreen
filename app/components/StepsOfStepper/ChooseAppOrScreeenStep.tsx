/* eslint-disable react/destructuring-assignment */
import React from 'react';
import { Text } from '@blueprintjs/core';
import ShareEntireScreenOrAppWindowControlGroup from '../ShareAppOrScreenControlGroup';

interface ChooseAppOrScreeenStepProps {
  handleNextEntireScreen: () => void;
  handleNextApplicationWindow: () => void;
}

const ChooseAppOrScreeenStep: React.FC<ChooseAppOrScreeenStepProps> = (
  props: ChooseAppOrScreeenStepProps
) => {
  return (
    <>
      <div style={{ marginBottom: '10px' }}>
        <Text>
          Choose Entire Screen or App window you want to view on other device
        </Text>
      </div>
      <ShareEntireScreenOrAppWindowControlGroup
        handleNextEntireScreen={props.handleNextEntireScreen}
        handleNextApplicationWindow={props.handleNextApplicationWindow}
      />
    </>
  );
};

export default ChooseAppOrScreeenStep;
