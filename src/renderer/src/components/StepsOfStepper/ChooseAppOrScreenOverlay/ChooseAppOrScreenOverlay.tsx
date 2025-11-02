import { useCallback, useEffect, useState } from 'react';
import { H3, Dialog, Button } from '@blueprintjs/core';
import { Row, Col } from 'react-flexbox-grid';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import CloseOverlayButton from '../../CloseOverlayButton';
import PreviewGridList from './PreviewGridList';
import { IpcEvents } from '../../../../../common/IpcEvents.enum';
import { useTranslation } from 'react-i18next';

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
  }),
);

interface ChooseAppOrScreenOverlayProps {
  isEntireScreenToShareChosen: boolean;
  isChooseAppOrScreenOverlayOpen: boolean;
  handleNextEntireScreen: () => void;
  handleNextApplicationWindow: () => void;
  handleClose: () => void;
  isWaylandSession: boolean;
}

export default function ChooseAppOrScreenOverlay(props: ChooseAppOrScreenOverlayProps) {
  const {
    handleClose,
    isChooseAppOrScreenOverlayOpen,
    isEntireScreenToShareChosen,
    handleNextEntireScreen,
    handleNextApplicationWindow,
    isWaylandSession,
  } = props;
  const classes = useStyles();
  const { t } = useTranslation();

  const [viewSharingIds, setViewSharingIds] = useState<string[]>([]);

  const handleRefreshSources = useCallback(async (): Promise<string[]> => {
    if (isWaylandSession) {
      setViewSharingIds([]);
      return [];
    }
    const ids = await window.electron.ipcRenderer.invoke(IpcEvents.GetDesktopSharingSourceIds, {
      isEntireScreenToShareChosen,
    });
    setViewSharingIds(ids);
    return ids;
  }, [isEntireScreenToShareChosen, isWaylandSession]);

  useEffect(() => {
    if (isWaylandSession) {
      return;
    }
    handleRefreshSources();
  }, [handleRefreshSources, isEntireScreenToShareChosen, isWaylandSession]);

  useEffect(() => {
    if (!isChooseAppOrScreenOverlayOpen || isWaylandSession) {
      return;
    }

    let cancelled = false;
    let attempts = 0;
    const maxAttempts = 8; // ~3.2s total if retryDelayMs = 400
    const retryDelayMs = 400;

    const attemptLoad = async () => {
      const ids = await handleRefreshSources();
      if (cancelled) return;
      if (ids.length > 0 || attempts >= maxAttempts) return;
      attempts += 1;
      setTimeout(() => {
        if (!cancelled) {
          attemptLoad();
        }
      }, retryDelayMs);
    };

    attemptLoad();

    return () => {
      cancelled = true;
    };
  }, [isChooseAppOrScreenOverlayOpen, handleRefreshSources]);

  return (
    <Dialog
      onClose={handleClose}
      className={`${classes.dialogRoot} choose-app-or-screen-dialog`}
      autoFocus
      canEscapeKeyClose
      canOutsideClickClose
      enforceFocus
      isOpen={isChooseAppOrScreenOverlayOpen}
      usePortal
      transitionDuration={0}
      style={{
        borderRadius: '8px',
      }}
    >
      <div
        id="choose-app-or-screen-overlay-container"
        style={{ minHeight: '95%', overflowX: 'hidden' }}
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
          <div
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
                backgroundColor: '#f6f7f9',
                borderRadius: '8px',
              }}
            >
              <Col xs={9}>
                {isEntireScreenToShareChosen ? (
                  <div>
                    <H3 style={{ marginBottom: '0px' }}>{t('select-entire-screen-to-share')}</H3>
                  </div>
                ) : (
                  <div>
                    <H3 style={{ marginBottom: '0px' }}>{t('select-app-window-to-share')}</H3>
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
                  {t('refresh')}
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
          </div>
        </div>

        <div
          style={{
            position: 'relative',
            zIndex: '1',
          }}
        >
          <div
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
          </div>
        </div>
      </div>
    </Dialog>
  );
}
