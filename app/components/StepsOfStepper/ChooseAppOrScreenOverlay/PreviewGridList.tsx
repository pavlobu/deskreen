import React from 'react';
import { ipcRenderer } from 'electron';
import { Row, Col } from 'react-flexbox-grid';
import SharingSourcePreviewCard from '../../SharingSourcePreviewCard';
import { IpcEvents } from '../../../main/IpcEvents.enum';

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
                ipcRenderer.invoke(IpcEvents.SetDesktopCapturerSourceId, id);
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
