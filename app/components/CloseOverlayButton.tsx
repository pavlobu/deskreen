/* eslint-disable react/require-default-props */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/destructuring-assignment */
import React from 'react';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { Button, Icon } from '@blueprintjs/core';

interface CloseOverlayButtonProps {
  onClick: () => void;
  style?: any;
  noDefaultStyles?: boolean;
  className?: string;
}

const useStyles = makeStyles(() =>
  createStyles({
    closeButton: {
      position: 'relative',
      width: '40px',
      height: '40px',
      left: 'calc(100% - 55px)',
      borderRadius: '100px',
      zIndex: 9999,
    },
  })
);

const CloseOverlayButton: React.FC<CloseOverlayButtonProps> = (
  props: CloseOverlayButtonProps
) => {
  const classes = useStyles();
  return (
    <Button
      id="close-overlay-button"
      className={
        props.noDefaultStyles ? '' : `${classes.closeButton} ${props.className}`
      }
      onClick={props.onClick}
      style={props.style}
    >
      <Icon icon="cross" iconSize={30} />
    </Button>
  );
};

export default CloseOverlayButton;
