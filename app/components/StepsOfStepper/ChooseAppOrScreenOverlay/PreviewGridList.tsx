/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/alt-text */
import React, { useEffect, useState, useCallback } from 'react';
import { Card, H4, Icon } from '@blueprintjs/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { Row, Col } from 'react-flexbox-grid';
import isProduction from '../../../utils/isProduction';

const Fade = require('react-reveal/Fade');

const useStyles = makeStyles(() =>
  createStyles({
    root: {
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'space-around',
      overflow: 'hidden',
    },
    gridList: {
      width: 500,
      height: 450,
    },
    icon: {
      color: 'rgba(255, 255, 255, 0.54)',
    },
    previewShareThumbContainer: {
      marginBottom: '20px',
      '&:hover': {
        backgroundColor: 'rgba(19, 124, 189, 0.4)',
      },
    },
  })
);

export default function PreviewGridList(props: any) {
  const classes = useStyles();

  const [showPreviewNamesMap, setShowPreviewNamesMap] = useState(new Map());

  useEffect(() => {
    const map = new Map();
    props.screenSharingObjects.forEach((el: { id: string }) => {
      map.set(el.id, false);
    });
    setShowPreviewNamesMap(map);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onPreviewMouseEnter = useCallback(
    (id) => {
      const newShowPreviewNamesMap = new Map(showPreviewNamesMap);
      [...newShowPreviewNamesMap.keys()].forEach((key) => {
        newShowPreviewNamesMap.set(key, false);
      });
      newShowPreviewNamesMap.set(id, true);
      setShowPreviewNamesMap(newShowPreviewNamesMap);
    },
    [showPreviewNamesMap, setShowPreviewNamesMap]
  );

  const onPreviewMouseLeave = useCallback(() => {
    const newShowPreviewNamesMap = new Map(showPreviewNamesMap);
    [...newShowPreviewNamesMap.keys()].forEach((key) => {
      newShowPreviewNamesMap.set(key, false);
    });
    setShowPreviewNamesMap(newShowPreviewNamesMap);
  }, [showPreviewNamesMap, setShowPreviewNamesMap]);

  return (
    <div
      style={{
        height: '90%',
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
      }}
    >
      {[...showPreviewNamesMap.keys()].map((id) => {
        return (
          <Col xs={12} md={6} lg={3} key={id}>
            <Card
              interactive
              elevation={2}
              className={`preview-share-thumb-container ${classes.previewShareThumbContainer}`}
              onClick={() => {
                if (props.isEntireScreen) {
                  props.handleNextEntireScreen();
                } else {
                  props.handleNextApplicationWindow();
                }
              }}
              onMouseEnter={() => onPreviewMouseEnter(id)}
              onMouseLeave={() => onPreviewMouseLeave()}
            >
              <div
                style={{
                  height: '250px',
                  position: 'relative',
                  overflow: 'hidden',
                  borderRadius: '5px',
                }}
              >
                <Row
                  middle="xs"
                  center="xs"
                  className="icon-or-preview-container"
                >
                  <Icon
                    icon={props.isEntireScreen ? 'desktop' : 'application'}
                    iconSize={150}
                    color="#A7B6C2"
                    style={{
                      position: 'absolute',
                      top: 'calc(50% - 75px)',
                      left: 'calc(50% - 75px)',
                    }}
                  />
                </Row>
                <Fade
                  when={showPreviewNamesMap.get(id)}
                  duration={isProduction() ? 300 : 0}
                >
                  <div
                    style={{
                      height: '100%',
                      background:
                        'radial-gradient(circle closest-side, rgba(0,0,0,0.025), rgba(0,0,0,0.1)',
                    }}
                  >
                    <Fade
                      bottom
                      when={showPreviewNamesMap.get(id)}
                      duration={isProduction() ? 300 : 0}
                    >
                      <div
                        style={{
                          position: 'relative',
                          bottom: 'calc(-100% + 42px)',
                          width: '100%',
                          backgroundColor: 'rgba(0,0,0,0.4)',
                          padding: '10px',
                        }}
                      >
                        <H4
                          style={{
                            paddingBottom: '0px',
                            marginBottom: '0px',
                            color: 'white',
                          }}
                        >
                          Preview Name
                        </H4>
                      </div>
                    </Fade>
                  </div>
                </Fade>
              </div>
            </Card>
          </Col>
        );
      })}
    </div>
  );
}
