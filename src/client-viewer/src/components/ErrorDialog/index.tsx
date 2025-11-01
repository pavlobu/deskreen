import {
  Classes,
  Dialog,
  Divider,
  H1,
  H2,
  H3,
  Icon
} from "@blueprintjs/core";
import { Col, Row } from 'react-flexbox-grid';
import { useTranslation } from 'react-i18next';
import './index.css';
import { type ErrorMessageType } from './ErrorMessageEnum';

interface ErrorDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  errorMessage: ErrorMessageType;
}

function ErrorDialog(props: ErrorDialogProps) {
  const { t } = useTranslation();
  const { errorMessage, isOpen, setIsOpen } = props;

  return (
    <Dialog
      className="error-dialog"
      autoFocus
      canEscapeKeyClose
      canOutsideClickClose={false}
      enforceFocus
      isOpen={isOpen}
      // usePortal
      style={{
        width: '90%',
        maxWidth: '1200px',
      }}
      backdropClassName="error-dialog-backdrop"
      onClose={() => {
        setIsOpen(false);
      }}
    >
      <Row center="xs" style={{ marginTop: '10px' }}>
        <Col xs={12}>
          <H3 className={Classes.TEXT_MUTED}>{t('Deskreen-CE Error Dialog')}</H3>
        </Col>
      </Row>
      <Row middle="xs" center="xs" style={{ padding: '20px', width: '100%' }}>
        <Col xs={12} md={10} lg={6}>
          <Row middle="xs" center="xs">
            <Col xs={1}>
              <Icon icon="error" size={52} color="#8A9BA8" />
            </Col>
            <Col xs={11}>
              <H1
                className={Classes.TEXT_DISABLED}
                style={{ marginBottom: '0px' }}
              >
                {`${t('Something went wrong')} :(`}
              </H1>
            </Col>
          </Row>
        </Col>
      </Row>
      <Divider />
      <div className={Classes.DIALOG_BODY}>
        <H3 className={Classes.TEXT_MUTED}>{t(`${errorMessage}`)}</H3>
        <Divider />
        <H2>{`${t('You may close this browser window then try to connect again')}.`}</H2>
      </div>
    </Dialog>
  );
}

export default ErrorDialog;
