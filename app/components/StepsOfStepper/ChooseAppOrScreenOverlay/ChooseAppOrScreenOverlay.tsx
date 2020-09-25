/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable react/no-unused-prop-types */
/* eslint-disable react/destructuring-assignment */
import React from 'react';
import { H3, Card, Dialog } from '@blueprintjs/core';
import { Row, Col } from 'react-flexbox-grid';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import CloseOverlayButton from '../../CloseOverlayButton';
import isProduction from '../../../utils/isProduction';
import PreviewGridList from './PreviewGridList';
import TEST_SCREEN_SHARING_OBECTS from '../../../constants/test-screen-sharing-objects.json';

const Zoom = require('react-reveal/Zoom');
const Fade = require('react-reveal/Fade');

const useStyles = makeStyles(() =>
  createStyles({
    dialogRoot: {
      width: '90%',
      height: '87vh !important',
      overflowY: 'scroll',
    },
    closeButton: {
      position: 'relative',
      width: '40px',
      height: '40px',
      left: 'calc(100% - 55px)',
      borderRadius: '100px',
      zIndex: 9999,
    },
    overlayInnerRoot: { width: '90%', height: '90%' },
    sharePreviewsContainer: {
      top: '60px',
      position: 'relative',
      height: '100%',
    },
  })
);

interface ChooseAppOrScreenOverlayProps {
  isEntireScreenToShareChosen: boolean;
  isChooseAppOrScreenOverlayOpen: boolean;
  handleNextEntireScreen: () => void;
  handleNextApplicationWindow: () => void;
  handleClose: () => void;
}

export default function ChooseAppOrScreenOverlay(
  props: ChooseAppOrScreenOverlayProps
) {
  const classes = useStyles();

  return (
    <Dialog
      onClose={props.handleClose}
      className={`${classes.dialogRoot} choose-app-or-screen-dialog`}
      autoFocus
      canEscapeKeyClose
      canOutsideClickClose
      enforceFocus
      hasBackdrop
      isOpen={props.isChooseAppOrScreenOverlayOpen}
      usePortal
      transitionDuration={isProduction() ? 750 : 0}
    >
      <div>
        <Fade
          duration={isProduction() ? 1000 : 0}
          delay={isProduction() ? 1000 : 0}
        >
          <div
            style={{
              position: 'fixed',
              zIndex: 99999,
              width: '90%',
              paddingTop: '0px',
              paddingLeft: '15px',
              paddingRight: '15px',
            }}
          >
            <Card
              elevation={2}
              style={{
                padding: '10px',
                borderRadius: '5px',
                height: '60px',
                width: '100%',
              }}
            >
              <Row
                between="xs"
                middle="xs"
                style={{
                  width: '100%',
                }}
              >
                <Col xs={11}>
                  {props.isEntireScreenToShareChosen ? (
                    <div>
                      <H3 style={{ marginBottom: '0px' }}>
                        Select Entire Screen to Share
                      </H3>
                    </div>
                  ) : (
                    <div>
                      <H3 style={{ marginBottom: '0px' }}>
                        Select App Window to Share
                      </H3>
                    </div>
                  )}
                </Col>

                <Col xs={1}>
                  <CloseOverlayButton
                    onClick={props.handleClose}
                    style={{
                      borderRadius: '100px',
                      width: '40px',
                      height: '40px',
                    }}
                    noDefaultStyles
                  />
                </Col>
              </Row>
            </Card>
          </div>
        </Fade>

        <Zoom
          duration={isProduction() ? 750 : 0}
          style={{
            position: 'relative',
            zIndex: '1',
          }}
        >
          <Card
            style={{
              position: 'relative',
              // @ts-ignore
              zIndex: '1',
            }}
          >
            <Row>
              <div className={classes.sharePreviewsContainer}>
                <PreviewGridList
                  screenSharingObjects={TEST_SCREEN_SHARING_OBECTS}
                  isEntireScreen={props.isEntireScreenToShareChosen}
                  handleNextEntireScreen={() => {
                    props.handleNextEntireScreen();
                    props.handleClose();
                  }}
                  handleNextApplicationWindow={() => {
                    props.handleNextApplicationWindow();
                    props.handleClose();
                  }}
                />
              </div>
            </Row>
          </Card>
        </Zoom>
      </div>
    </Dialog>
  );
}
