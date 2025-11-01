import React, { useEffect, useRef, useState } from 'react';
import { Text, Card, Spinner } from '@blueprintjs/core';
import { Row, Col } from 'react-flexbox-grid';
import { IpcEvents } from '../../../../common/IpcEvents.enum';
import { useTranslation } from 'react-i18next';

class SharingSourcePreviewCardProps {
  sharingSourceID: string | undefined = '';

  onClickCard? = (): void => {};

  isChangeAppearanceOnHover? = false;
}

const SharingSourcePreviewCard: React.FC<SharingSourcePreviewCardProps> = (props) => {
  const { isChangeAppearanceOnHover, onClickCard, sharingSourceID } = props;
  const [sourceImage, setSourceImage] = useState('');
  const [sourceName, setSourceName] = useState('');
  const [appIconSourceImage, setAppIconSourceImage] = useState('');
  const [isHovered, setIsHovered] = useState(false);
  const { t } = useTranslation();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!rootRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { root: null, threshold: 0.1 },
    );
    observer.observe(rootRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    const timer = setTimeout(async () => {
      if (!sharingSourceID) return;
      const sources = await window.electron.ipcRenderer.invoke(
        IpcEvents.GetDesktopCapturerServiceSourcesByIds,
        [sharingSourceID],
      );

      const data = sources?.[sharingSourceID];
      if (data) {
        setSourceImage((data?.source.thumbnail as unknown as string) || '');
        if (data?.source.appIcon != null) {
          setAppIconSourceImage((data?.source.appIcon as unknown as string) || '');
        }
        setSourceName(data?.source.name || t('failed-to-get-source-name'));
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [isVisible, sharingSourceID]);

  return (
    <div ref={rootRef}>
      <Card
      className="preview-share-thumb-container"
      onClick={onClickCard ? () => onClickCard() : () => {}}
      style={{
        height: '200px',
        minWidth: '250px',
        backgroundColor: isHovered && isChangeAppearanceOnHover ? '#2B95D6' : 'rgba(0,0,0,0.0)',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseOver={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Row center="xs" middle="xs" style={{ height: '95%', minWidth: '200px' }}>
        <Col xs={12}>
          {sourceImage !== '' ? (
            <>
              <img src={sourceImage} alt="" style={{ height: '143px', maxWidth: '100%' }} />
              {appIconSourceImage !== '' ? (
                <Card
                  style={{
                    position: 'absolute',
                    width: '40px',
                    height: '40px',
                    transform: 'translate(0px, -45px)',
                    borderRadius: '500px',
                    padding: '0px',
                    margin: '0px',
                  }}
                  elevation={4}
                >
                  <Row center="xs" middle="xs" style={{ height: '100%' }}>
                    <img
                      src={appIconSourceImage}
                      alt=""
                      style={{
                        width: '25px',
                        height: '25px',
                      }}
                    />
                  </Row>
                </Card>
              ) : (
                <> </>
              )}
            </>
          ) : (
            <Spinner size={60} />
          )}
        </Col>
      </Row>
      <Row center="xs">
        <Col
          xs={12}
          style={{
            backgroundColor:
              isHovered && isChangeAppearanceOnHover ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.45)',
            color: 'white',
            textAlign: 'center',
          }}
        >
          <Text ellipsize>{sourceName}</Text>
        </Col>
      </Row>
      </Card>
    </div>
  );
};

export default SharingSourcePreviewCard;
