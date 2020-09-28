import React, { useContext } from 'react';
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
  const { icon, label, input } = props;
  const { isDarkTheme } = useContext(SettingsContext);

  const getClassesCallback = useStylesWithTheme(isDarkTheme);

  return (
    <Row middle="xs" between="xs">
      <Col xs={6}>
        <Row middle="xs" className={getClassesCallback().oneSettingRow}>
          <Col>
            <Icon
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore: ok here
              icon={icon}
              iconSize={25}
              className={getClassesCallback().settingRowIcon}
            />
          </Col>
          <Col>
            <Text>{label}</Text>
          </Col>
        </Row>
      </Col>
      <Col xs={6}>
        <Row>{input}</Row>
      </Col>
    </Row>
  );
}
