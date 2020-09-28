import { remote } from 'electron';
import React, { useEffect, useState } from 'react';
import { Row, Col } from 'react-flexbox-grid';
import SharingSessionService from '../../../features/SharingSessionsService';
import SharingSourcePreviewCard from '../../SharingSourcePreviewCard';

const sharingSessionService = remote.getGlobal(
  'sharingSessionService'
) as SharingSessionService;

const EMPTY_VIEW_SHARING_OBJECTS_MAP = new Map<string, ViewSharingObject>();

class PreviewGridListProps {
  viewSharingObjectsMap = EMPTY_VIEW_SHARING_OBJECTS_MAP;

  isEntireScreen = true;

  handleNextEntireScreen = () => {};

  handleNextApplicationWindow = () => {};
}

export default function PreviewGridList(props: PreviewGridListProps) {
  const {
    viewSharingObjectsMap,
    isEntireScreen,
    handleNextEntireScreen,
    handleNextApplicationWindow,
  } = props;
  const [showPreviewNamesMap, setShowPreviewNamesMap] = useState(
    new Map<string, boolean>()
  );

  useEffect(() => {
    const map = new Map<string, boolean>();
    if (viewSharingObjectsMap === EMPTY_VIEW_SHARING_OBJECTS_MAP) {
      setShowPreviewNamesMap(map);
      return;
    }
    [...viewSharingObjectsMap.keys()].forEach((id: string) => {
      map.set(id, false);
    });
    setShowPreviewNamesMap(map);
  }, [viewSharingObjectsMap]);

  return (
    <Row
      center="xs"
      around="xs"
      style={{
        height: '90%',
      }}
    >
      {[...showPreviewNamesMap.keys()].map((id) => {
        return (
          <Col xs={12} md={6} key={id}>
            <SharingSourcePreviewCard
              sharingSourceID={id}
              isChangeApperanceOnHover
              onClickCard={async () => {
                let sharingSession;
                if (
                  sharingSessionService.waitingForConnectionSharingSession !==
                  null
                ) {
                  sharingSession =
                    sharingSessionService.waitingForConnectionSharingSession;
                  sharingSession.setDesktopCapturerSourceID(id);
                }
                if (isEntireScreen) {
                  handleNextEntireScreen();
                } else {
                  handleNextApplicationWindow();
                }
              }}
            />
          </Col>
        );
      })}
    </Row>
  );
}
