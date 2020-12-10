/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable @typescript-eslint/ban-ts-comment */

import React, { useRef } from 'react';
import { Classes } from '@blueprintjs/core';
import { ToastProvider, DefaultToast } from 'react-toast-notifications';

import TopPanel from '../components/TopPanel';
import { LIGHT_UI_BACKGROUND } from './SettingsProvider';
import DeskreenStepper from './DeskreenStepper';

// @ts-ignore: it is ok here, be like js it is fine
// eslint-disable-next-line react/prop-types
export const CustomToastWithTheme = ({ children, ...props }) => {
  return (
    <DefaultToast
      components={{ Toast: CustomToastWithTheme }}
      {...props}
      // @ts-ignore: some minor type complain, it is fine here
      style={{
        // eslint-disable-next-line react/prop-types
        color: props.isdarktheme === 'false' ? '#293742' : '#BFCCD6',
        backgroundColor:
          // eslint-disable-next-line react/prop-types
          props.isdarktheme === 'false' ? LIGHT_UI_BACKGROUND : '#394B59',
      }}
    >
      <>{children}</>
    </DefaultToast>
  );
};

export default function HomePage() {
  const stepperRef = useRef();

  return (
    <ToastProvider
      placement="top-center"
      autoDismissTimeout={5000}
      components={{ Toast: CustomToastWithTheme }}
    >
      <div className={Classes.TREE}>
        <TopPanel stepperRef={stepperRef} />
        <DeskreenStepper ref={stepperRef} />
        {/* <Home /> */}
      </div>
    </ToastProvider>
  );
}
