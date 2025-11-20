import { withStyles } from '@material-ui/core/styles';
import StepConnector from '@material-ui/core/StepConnector';

const ColorlibConnector = withStyles({
	alternativeLabel: {
		top: 43,
	},
	active: {
		'& $line': {
			backgroundImage:
				'linear-gradient( 95deg, #3DCC91 0%, #15B371 50%, #FFB366 100%)',
		},
	},
	completed: {
		'& $line': {
			backgroundImage:
				'linear-gradient( 95deg, #3DCC91 0%, #15B371 50%, #3DCC91 100%)',
		},
	},
	line: {
		height: 2,
		border: 0,
		backgroundColor: '#CED9E0',
		borderRadius: 1,
	},
})(StepConnector);

export default ColorlibConnector;
