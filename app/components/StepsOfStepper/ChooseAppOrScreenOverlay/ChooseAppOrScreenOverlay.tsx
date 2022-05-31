import { ipcRenderer } from 'electron';
import React, { useCallback, useEffect, useState } from 'react';
import { H3, Card, Dialog, Button } from '@blueprintjs/core';
import { Row, Col } from 'react-flexbox-grid';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { useTranslation } from 'react-i18next';
import CloseOverlayButton from '../../CloseOverlayButton';
import PreviewGridList from './PreviewGridList';
import isWithReactRevealAnimations from '../../../utils/isWithReactRevealAnimations';
import { IpcEvents } from '../../../main/IpcEvents.enum';

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
  const { t } = useTranslation();

  const {
    handleClose,
    isChooseAppOrScreenOverlayOpen,
    isEntireScreenToShareChosen,
    handleNextEntireScreen,
    handleNextApplicationWindow,
  } = props;
  const classes = useStyles();

  const [viewSharingIds, setViewSharingIds] = useState<string[]>([]);

  const handleRefreshSources = useCallback(async () => {
    const ids = await ipcRenderer.invoke(IpcEvents.GetDesktopSharingSourceIds, {
      isEntireScreenToShareChosen,
    });
    setViewSharingIds(ids);
  }, [isEntireScreenToShareChosen]);

  useEffect(() => {
    handleRefreshSources();
  }, [handleRefreshSources, isEntireScreenToShareChosen]);

  return (
    <Dialog
      onClose={handleClose}
      className={`${classes.dialogRoot} choose-app-or-screen-dialog`}
      autoFocus
      canEscapeKeyClose
      canOutsideClickClose
      enforceFocus
      hasBackdrop
      isOpen={isChooseAppOrScreenOverlayOpen}
      usePortal
      transitionDuration={isWithReactRevealAnimations() ? 750 : 0}
    >
      <div
        id="choose-app-or-screen-overlay-container"
        style={{ minHeight: '95%' }}
      >
        <Fade
          duration={isWithReactRevealAnimations() ? 1000 : 0}
          delay={isWithReactRevealAnimations() ? 1000 : 0}
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
                <Col xs={9}>
                  {isEntireScreenToShareChosen ? (
                    <div>
                      <H3 style={{ marginBottom: '0px' }}>
                        {t('Select Entire Screen to Share')}
                      </H3>
                    </div>
                  ) : (
                    <div>
                      <H3 style={{ marginBottom: '0px' }}>
                        {t('Select App Window to Share')}
                      </H3>
                    </div>
                  )}
                </Col>
                <Col xs={2}>
                  <Button
                    icon="refresh"
                    intent="warning"
                    onClick={handleRefreshSources}
                    style={{
                      borderRadius: '100px',
                      width: 'max-content',
                    }}
                  >
                    {t('Refresh')}
                  </Button>
                </Col>

                <Col xs={1}>
                  <CloseOverlayButton
                    onClick={handleClose}
                    style={{
                      borderRadius: '100px',
                      width: '40px',
                      height: '40px',
                    }}
                  />
                </Col>
              </Row>
            </Card>
          </div>
        </Fade>

        <Zoom
          duration={isWithReactRevealAnimations() ? 750 : 0}
          style={{
            position: 'relative',
            zIndex: '1',
          }}
        >
          <Card
            style={{
              position: 'relative',
              zIndex: 1,
              height: '100%',
            }}
          >
            <Row>
              <div className={classes.sharePreviewsContainer}>
                <PreviewGridList
                  viewSharingIds={viewSharingIds}
                  isEntireScreen={isEntireScreenToShareChosen}
                  handleNextEntireScreen={() => {
                    handleNextEntireScreen();
                    handleClose();
                  }}
                  handleNextApplicationWindow={() => {
                    handleNextApplicationWindow();
                    handleClose();
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
