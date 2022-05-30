import React from 'react';
import { remote } from 'electron';
import { Row, Col } from 'react-flexbox-grid';
import SharingSessionService from '../../../features/SharingSessionService';
import SharingSourcePreviewCard from '../../SharingSourcePreviewCard';

const sharingSessionService = remote.getGlobal(
  'sharingSessionService'
) as SharingSessionService;

class PreviewGridListProps {
  viewSharingIds: string[] = [];

  isEntireScreen = true;

  handleNextEntireScreen = () => {};

  handleNextApplicationWindow = () => {};
}

export default function PreviewGridList(props: PreviewGridListProps) {
  const {
    viewSharingIds,
    isEntireScreen,
    handleNextEntireScreen,
    handleNextApplicationWindow,
  } = props;

  return (
    <Row
      center="xs"
      around="xs"
      style={{
        height: '90%',
      }}
    >
      {viewSharingIds.map((id) => {
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
