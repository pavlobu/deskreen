import React from 'react';
import { Row, Col } from 'react-flexbox-grid';
import { Icon, Text } from '@blueprintjs/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(() =>
	createStyles({
		oneSettingRow: {
			color: '#5C7080 !important',
			fontSize: '18px',
			fontWeight: 900,
			display: 'flex',
			flexDirection: 'row',
			alignItems: 'center',
		},
		settingRowIcon: {
			margin: '10px',
			color: '#8A9BA8',
		},
	}),
);

interface SettingRowLabelAndInput {
	icon: string;
	label: string;
	input: React.ReactNode;
}

export default function SettingRowLabelAndInput(
	props: SettingRowLabelAndInput,
) {
	const { icon, label, input } = props;
	const classes = useStyles();

	return (
		<Row middle="xs" between="xs" style={{ display: 'flex', width: '100%' }}>
			<div style={{ flex: 8 }}>
				<div className={classes.oneSettingRow}>
					<Col>
						<Icon
							// @ts-ignore: ok here
							icon={icon}
							size={25}
							className={classes.settingRowIcon}
						/>
					</Col>
					<Col>
						<Text>{label}</Text>
					</Col>
				</div>
			</div>
			<div style={{ flex: 1 }}>
				<Row>{input}</Row>
			</div>
		</Row>
	);
}
