/* eslint-disable react/destructuring-assignment */
import React from 'react';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { Button, Icon } from '@blueprintjs/core';

class CloseOverlayButtonProps {
  onClick = () => {};

  style? = {};

  isDefaultStyles? = false;

  className? = '';
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
  const { className, isDefaultStyles, style, onClick } = props;
  const classes = useStyles();
  return (
    <Button
      id="close-overlay-button"
      className={isDefaultStyles ? `${classes.closeButton} ${className}` : ''}
      onClick={onClick}
      style={style}
    >
      <Icon icon="cross" iconSize={30} />
    </Button>
  );
};

export default CloseOverlayButton;
