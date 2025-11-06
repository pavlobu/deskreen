import { Row, Col } from 'react-flexbox-grid';
import { useTranslation } from 'react-i18next';
import { LIGHT_UI_BACKGROUND } from '../../constants/styleConstants';
import MyDeviceInfoCard from '../../components/MyDeviceInfoCard';
import type {TFunction} from 'i18next';
import { Button, H3 } from '@blueprintjs/core';
import ConnectingIndicator from '../../components/ConnectingIndicator';
import DeskreenLogo from '../../images/deskreen_logo_128x128.png';

interface ConnectionPropmptsProps {
  myDeviceDetails: DeviceDetails;
  isShownTextPrompt: boolean;
  promptStep: number;
  connectionIconType: ConnectionIconType;
  isShownSpinnerIcon: boolean;
  spinnerIconType: LoadingSharingIconType;
}

function getPromptContent(t: TFunction, step: number) {
  switch (step) {
    case 1:
      return (
        <H3>
          {t(
            'Waiting for user to click ALLOW button on screen sharing device...'
          ) as string}
        </H3>
      );
    case 2:
      return <H3>{t('Connected!') as string}</H3>;
    case 3:
      return (
        <H3>
          {t(
            'Waiting for user to select source to share from screen sharing device...'
          ) as string}
        </H3>
      );
    default:
      return <H3>{`${t('Error occurred')} :(`}</H3>;
  }
}

function ConnectionPropmpts(props: ConnectionPropmptsProps) {
  const {
    myDeviceDetails,
    promptStep,
    connectionIconType,
    isShownSpinnerIcon,
    spinnerIconType,
  } = props;

  const { t } = useTranslation();

	const handleReinitiateConnection = () => {
		window.location.reload();
	};

  return (
      <div
        style={{
          position: 'absolute',
          zIndex: 10,
          top: 0,
          left: 0,
          width: '100%',
          height: '100vh',
          boxShadow: '0 0 0 5px #A7B6C2',
          backgroundColor: LIGHT_UI_BACKGROUND,
        }}
      >
        <Row
          bottom="xs"
          style={{
            height: '50vh',
            width: '100%',
            marginRight: '0px',
            marginLeft: '0px',
          }}
        >
          <Row center="xs" style={{width: '100%', margin: '0 auto'}}>
            <Col
              xs={12}
              style={{
                marginBottom: '50px',
                textAlign: 'center',
                width: '100%',
              }}
            >
              <div style={{width: '100%'}}>
                <Row center="xs" style={{marginTop: '30px', marginBottom: '10px'}}>
                  <img
                    src={DeskreenLogo}
                    alt="Deskreen Logo"
                    style={{
                      width: '80px',
                      height: '80px',
                      marginBottom: '5px',
                    }}
                  />
                </Row>
                <Row center="xs">
                  <H3>Deskreen CE Viewer</H3>
                </Row>
                <Row center="xs" style={{width: '100%', margin: '0 auto'}}>
                  <Col md={6} xl={4}>
                    <MyDeviceInfoCard deviceDetails={myDeviceDetails}/>
                  </Col>
                </Row>
                <div id="prompt-text" style={{fontSize: '20px'}}>
                  {getPromptContent(t, promptStep)}
                </div>
			<Row center="xs" style={{marginTop: '20px'}}>
				<Button
					className="rounded-pill-button"
					intent="warning"
					onClick={handleReinitiateConnection}
				>
					{t('re-initiate-connection') as string}
				</Button>
			</Row>
              </div>
            </Col>
          </Row>
        </Row>
        <ConnectingIndicator
          currentStep={promptStep}
          connectionIconType={connectionIconType}
          isShownSelectingSharingIcon={isShownSpinnerIcon}
          selectingSharingIconType={spinnerIconType}
        />
      </div>
    );
}

export default ConnectionPropmpts;
