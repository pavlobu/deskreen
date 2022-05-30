import React, { useEffect, useState } from 'react';
import { ipcRenderer } from 'electron';
import { Text, Card, Spinner } from '@blueprintjs/core';
import { Row, Col } from 'react-flexbox-grid';
import { IpcEvents } from '../../main/IpcEvents.enum';

class SharingSourcePreviewCardProps {
  sharingSourceID: string | undefined = '';

  onClickCard? = () => {};

  isChangeApperanceOnHover? = false;
}

export default function SharingSourcePreviewCard(
  props: SharingSourcePreviewCardProps
) {
  const { sharingSourceID, isChangeApperanceOnHover, onClickCard } = props;
  const [sourceImage, setSourceImage] = useState('');
  const [sourceName, setSourceName] = useState('');
  const [appIconSourceImage, setAppIconSourceImage] = useState('');
  const [isHovered, setIsHovered] = useState(false);
  useEffect(() => {
    setTimeout(async () => {
      const sources = await ipcRenderer.invoke(
        IpcEvents.GetDesktopCapturerServiceSourcesMap
      );

      if (sources && sharingSourceID && sources[sharingSourceID]) {
        setSourceImage(
          ((sources[sharingSourceID]?.source.thumbnail as unknown) as string) ||
            ''
        );
        if (sources[sharingSourceID]?.source.appIcon != null) {
          setAppIconSourceImage(
            ((sources[sharingSourceID]?.source.appIcon as unknown) as string) ||
              ''
          );
        }
        setSourceName(
          sources[sharingSourceID]?.source.name ||
            'Failed to get source name...'
        );
      }
    }, 1000);
  }, [sharingSourceID]);

  return (
    <Card
      className="preview-share-thumb-container"
      onClick={onClickCard ? () => onClickCard() : () => {}}
      style={{
        height: '200px',
        minWidth: '250px',
        backgroundColor:
          isHovered && isChangeApperanceOnHover ? '#2B95D6' : 'rgba(0,0,0,0.0)',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseOver={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Row center="xs" middle="xs" style={{ height: '95%', minWidth: '200px' }}>
        <Col xs={12}>
          {sourceImage !== '' ? (
            <>
              <img
                src={sourceImage}
                alt=""
                style={{ height: '143px', maxWidth: '100%' }}
              />
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
              isHovered && isChangeApperanceOnHover
                ? 'rgba(0,0,0,0.8)'
                : 'rgba(0,0,0,0.45)',
            color: 'white',
            textAlign: 'center',
          }}
        >
          <Text ellipsize>{sourceName}</Text>
        </Col>
      </Row>
    </Card>
  );
}
