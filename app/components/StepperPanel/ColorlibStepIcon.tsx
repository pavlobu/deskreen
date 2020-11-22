import React from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import { StepIconProps } from '@material-ui/core/StepIcon';
import { Icon } from '@blueprintjs/core';

export interface StepIconPropsDeskreen extends StepIconProps {
  isEntireScreenSelected: boolean;
  isApplicationWindowSelected: boolean;
}

const useColorlibStepIconStyles = makeStyles({
  root: {
    backgroundColor: '#BFCCD6',
    zIndex: 1,
    color: '#5C7080',
    width: 65,
    height: 65,
    display: 'flex',
    borderRadius: '50%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  active: {
    backgroundImage:
      'linear-gradient( 136deg, #FFB366 0%, #F29D49 50%, #A66321 100%)',
    boxShadow: '0 4px 10px 0 rgba(0,0,0,.25)',
  },
  completed: {
    backgroundImage:
      'linear-gradient( 136deg, #3DCC91 0%, #15B371 50%, #0E5A8A 100%)',
  },
  stepContent: {},
});

const getDesktopOrAppIcon = (isDesktop: boolean, color: string) => {
  if (isDesktop) {
    return <Icon icon="desktop" iconSize={25} color={color} />;
  }
  return <Icon icon="application" iconSize={25} color={color} />;
};

export default function ColorlibStepIcon(props: StepIconPropsDeskreen) {
  const { icon } = props;
  const classes = useColorlibStepIconStyles();
  const { active, completed, isEntireScreenSelected } = props;

  const color = active || completed ? '#fff' : '#5C7080';

  const icons: { [index: string]: React.ReactElement } = {
    1: completed ? (
      <Icon icon="feed-subscribed" iconSize={25} color={color} />
    ) : (
      <Icon icon="feed" iconSize={25} color={color} />
    ),
    2: completed ? (
      getDesktopOrAppIcon(isEntireScreenSelected, color)
    ) : (
      <Icon icon="flow-branch" iconSize={25} color={color} />
    ),
    3: completed ? (
      <Icon icon="tick-circle" iconSize={25} color={color} />
    ) : (
      <Icon icon="confirm" iconSize={25} color={color} />
    ),
  };

  return (
    <div
      className={`${clsx(classes.root, {
        [classes.active]: active,
        [classes.completed]: completed,
      })} ${active ? 'active-stepper-pulse-icon' : ''}`}
    >
      {icons[String(icon)]}
    </div>
  );
}
