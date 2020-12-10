import React, { useState, useCallback } from 'react';
import { Button, Icon, ControlGroup, Text } from '@blueprintjs/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import ChooseAppOrScreenOverlay from './StepsOfStepper/ChooseAppOrScreenOverlay/ChooseAppOrScreenOverlay';

interface ShareAppOrScreenControlGroupProps {
  handleNextEntireScreen: () => void;
  handleNextApplicationWindow: () => void;
}

const useStyles = makeStyles(() =>
  createStyles({
    controlGroupRoot: {
      width: '500px',
      display: 'flex',
      position: 'relative',
      left: '20px',
    },
    shareEntireScreenButton: {
      height: '180px',
      width: '50%',
      color: 'white',
      fontSize: '20px',
      borderRadius: '20px 0px 0px 20px !important',
      textAlign: 'center',
    },
    shareEntireScreenButtonIcon: { marginBottom: '20px' },
    shareAppButton: {
      height: '180px',
      width: '50%',
      borderRadius: '0px 20px 20px 0px !important',
      color: 'white',
      fontSize: '20px',
      textAlign: 'center',
      backgroundColor: '#48AFF0 !important',
      '&:hover': {
        backgroundColor: '#4097ce !important',
      },
    },
    shareAppButtonIcon: { marginBottom: '20px' },
    orDecorationButton: {
      height: '38px',
      width: '40px',
      borderRadius: '100px !important',
      position: 'relative',
      top: '70px',
      left: '-190px !important',
      cursor: 'default',
    },
  })
);

export default function ShareAppOrScreenControlGroup(
  props: ShareAppOrScreenControlGroupProps
) {
  const { handleNextEntireScreen, handleNextApplicationWindow } = props;
  const classes = useStyles();

  const [
    isChooseAppOrScreenOverlayOpen,
    setChooseAppOrScreenOverlayOpen,
  ] = useState(false);

  const [isEntireScreenToShareChosen, setEntireScreenToShareChosen] = useState(
    false
  );

  const handleOpenChooseAppOrScreenOverlay = useCallback(() => {
    setChooseAppOrScreenOverlayOpen(true);
  }, []);

  const handleCloseChooseAppOrScreenOverlay = useCallback(() => {
    setChooseAppOrScreenOverlayOpen(false);
  }, []);

  const handleChooseAppOverlayOpen = useCallback(() => {
    setEntireScreenToShareChosen(false);
    handleOpenChooseAppOrScreenOverlay();
  }, [handleOpenChooseAppOrScreenOverlay]);

  const handleChooseEntireScreenOverlayOpen = useCallback(() => {
    setEntireScreenToShareChosen(true);
    handleOpenChooseAppOrScreenOverlay();
  }, [handleOpenChooseAppOrScreenOverlay]);

  return (
    <>
      <ControlGroup
        id="share-screen-or-app-btn-group"
        className={classes.controlGroupRoot}
        fill
        vertical={false}
        style={{ width: '380px' }}
      >
        <Button
          className={classes.shareEntireScreenButton}
          intent="primary"
          onClick={handleChooseEntireScreenOverlayOpen}
        >
          <Icon
            className={classes.shareEntireScreenButtonIcon}
            icon="desktop"
            iconSize={100}
            color="white"
          />
          <Text className="bp3-running-text">Entire Screen</Text>
        </Button>
        <Button
          className={classes.shareAppButton}
          intent="primary"
          onClick={handleChooseAppOverlayOpen}
        >
          <Icon
            className={classes.shareAppButtonIcon}
            icon="application"
            iconSize={100}
            color="white"
          />
          <Text className="bp3-running-text">Application Window</Text>
        </Button>
        <Button
          active
          className={classes.orDecorationButton}
          style={{ zIndex: 999 }}
        >
          OR
        </Button>
      </ControlGroup>
      <ChooseAppOrScreenOverlay
        isEntireScreenToShareChosen={isEntireScreenToShareChosen}
        isChooseAppOrScreenOverlayOpen={isChooseAppOrScreenOverlayOpen}
        handleClose={handleCloseChooseAppOrScreenOverlay}
        handleNextEntireScreen={handleNextEntireScreen}
        handleNextApplicationWindow={handleNextApplicationWindow}
      />
    </>
  );
}
