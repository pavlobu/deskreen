/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable react/destructuring-assignment */
import React, { useCallback, useContext } from 'react';
import { Row, Col } from 'react-flexbox-grid';
import { Icon, Text } from '@blueprintjs/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { SettingsContext } from '../../containers/SettingsProvider';

const useStylesWithTheme = (isDarkTheme: boolean) =>
  makeStyles(() =>
    createStyles({
      oneSettingRow: {
        color: isDarkTheme ? '#CED9E0 !important' : '#5C7080 !important',
        fontSize: '18px',
        fontWeight: 900,
      },
      settingRowIcon: {
        margin: '10px',
        color: isDarkTheme ? '#BFCCD6' : '#8A9BA8',
      },
    })
  );

interface SettingRowLabelAndInput {
  icon: string;
  label: string;
  input: React.ReactNode;
}

export default function SettingRowLabelAndInput(
  props: SettingRowLabelAndInput
) {
  const { isDarkTheme } = useContext(SettingsContext);

  const getClassesCallback = useCallback(() => {
    // TODO: dont use callback inside callback, then how to use styles with theme?
    return useStylesWithTheme(isDarkTheme)();
  }, [isDarkTheme]);

  return (
    <Row middle="xs" between="xs">
      <Col xs={6}>
        <Row middle="xs" className={getClassesCallback().oneSettingRow}>
          <Col>
            <Icon
              // @ts-ignore: ok here
              icon={props.icon}
              iconSize={25}
              className={getClassesCallback().settingRowIcon}
            />
          </Col>
          <Col>
            <Text>{props.label}</Text>
          </Col>
        </Row>
      </Col>
      <Col xs={6}>
        <Row>{props.input}</Row>
      </Col>
    </Row>
  );
}
