import { useEffect, useState } from 'react';
import {
	Button,
	Classes,
	Dialog,
	Divider,
	H2,
	H3,
	HTMLSelect,
	Icon,
} from '@blueprintjs/core';
import { Col, Row } from 'react-flexbox-grid';
import { useTranslation } from 'react-i18next';
import i18nInstance from '../../config/i18n';
import './index.css';

interface PrivacyConsentDialogProps {
	isOpen: boolean;
	onAccept: () => void;
	onOptOut: () => void;
}

const AVAILABLE_LANGUAGES = [
	{ code: 'en', name: 'English' },
	{ code: 'es', name: 'Español' },
	{ code: 'de', name: 'Deutsch' },
	{ code: 'fr', name: 'Français' },
	{ code: 'ko', name: '한국어' },
	{ code: 'fi', name: 'Suomi' },
	{ code: 'it', name: 'Italiano' },
	{ code: 'da', name: 'Dansk' },
	{ code: 'sv', name: 'Svenska' },
	{ code: 'nl', name: 'Nederlands' },
	{ code: 'ua', name: 'Українська' },
	{ code: 'ru', name: 'Русский' },
	{ code: 'zh_CN', name: '简体中文' },
	{ code: 'zh_TW', name: '繁體中文' },
	{ code: 'ja', name: '日本語' },
];

function TranslatedContent() {
	const { t } = useTranslation();

	return (
		<>
			<H2 style={{ marginBottom: '16px' }}>{t('Analytics Reference')}</H2>
			<p style={{ marginBottom: '16px' }}>
				{t('This app uses Google Analytics (a free service by Google) to anonymously track basic usage data. This helps us understand how people use the app so we can improve it for everyone.')}
			</p>

			<H2 style={{ marginBottom: '16px', marginTop: '24px' }}>{t('What we collect:')}</H2>
			<ul style={{ marginBottom: '16px', paddingLeft: '20px' }}>
				<li>{t('Page views (which screens you visit)')}</li>
				<li>{t('Time spent on pages')}</li>
				<li>{t('Basic device info (browser type, screen size)')}</li>
				<li>{t('Your IP address (anonymized — last part removed for privacy)')}</li>
			</ul>

			<H2 style={{ marginBottom: '16px', marginTop: '24px' }}>{t('What we DON\'T collect:')}</H2>
			<ul style={{ marginBottom: '16px', paddingLeft: '20px' }}>
				<li>{t('Personal info (names, emails, passwords)')}</li>
				<li>{t('Exact location')}</li>
				<li>{t('Any files or content you interact with')}</li>
			</ul>

			<H2 style={{ marginBottom: '16px', marginTop: '24px' }}>{t('Why anonymous?')}</H2>
			<p style={{ marginBottom: '16px' }}>
				{t('Your IP is automatically shortened, and no one can identify you personally from this data.')}
			</p>

			<H2 style={{ marginBottom: '16px', marginTop: '24px' }}>{t('Your options:')}</H2>
			<p style={{ marginBottom: '16px' }}>
				<strong>{t('Continue:')}</strong> {t('We\'ll track anonymized usage to help improve the app.')}
			</p>
			<p style={{ marginBottom: '16px' }}>
				<strong>{t('Opt out:')}</strong> {t('Click the Disagree button below to disable tracking. (We\'ll respect this choice, but you might miss out on future improvements based on collective feedback.)')}
			</p>

			<p style={{ marginBottom: '24px', fontSize: '14px', color: '#5C7080' }}>
				{t('Data goes to: Google Analytics. See')}{' '}
				<a
					href="https://policies.google.com/privacy"
					target="_blank"
					rel="noopener noreferrer"
				>
					{t('their privacy policy')}
				</a>
				.
			</p>
		</>
	);
}

function TranslatedButtons({ onAccept, onOptOut }: { onAccept: () => void; onOptOut: () => void }) {
	const { t } = useTranslation();

	return (
		<Row center="xs" style={{ padding: '20px', gap: '16px' }}>
			<Col xs={12} sm={5}>
				<Button
					intent="none"
					large
					fill
					style={{ height: '50px', fontSize: '16px' }}
					onClick={onAccept}
				>
					{t('Accept')}
				</Button>
			</Col>
			<Col xs={12} sm={5}>
				<Button
					intent="none"
					large
					fill
					style={{ height: '50px', fontSize: '16px' }}
					onClick={onOptOut}
				>
					{t('Disagree')}
				</Button>
			</Col>
		</Row>
	);
}

function PrivacyConsentDialog(props: PrivacyConsentDialogProps) {
	const { t, i18n } = useTranslation();
	const { isOpen, onAccept, onOptOut } = props;
	const [currentLanguage, setCurrentLanguage] = useState(i18n.language || 'en');
	const [forceUpdate, setForceUpdate] = useState(0);

	useEffect(() => {
		const updateLanguage = () => {
			const newLang = i18nInstance.language || 'en';
			setCurrentLanguage(newLang);
			setForceUpdate(prev => prev + 1);
		};

		const handleLanguageChanged = () => {
			updateLanguage();
		};

		i18nInstance.on('languageChanged', handleLanguageChanged);
		i18nInstance.on('loaded', handleLanguageChanged);

		return () => {
			i18nInstance.off('languageChanged', handleLanguageChanged);
			i18nInstance.off('loaded', handleLanguageChanged);
		};
	}, []);

	const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
		const newLang = event.target.value;
		i18nInstance.changeLanguage(newLang).then(() => {
			setCurrentLanguage(newLang);
			setForceUpdate(prev => prev + 1);
		}).catch((err) => {
			console.error('Error changing language:', err);
		});
	};

	const langKey = `${currentLanguage}-${forceUpdate}`;

	return (
		<Dialog
			className="privacy-consent-dialog"
			autoFocus
			canEscapeKeyClose={false}
			canOutsideClickClose={false}
			enforceFocus
			isOpen={isOpen}
			style={{
				width: '90%',
				maxWidth: '800px',
				display: 'flex',
				flexDirection: 'column',
				maxHeight: '90vh',
			}}
			backdropClassName="privacy-consent-dialog-backdrop"
		>
			<Row style={{ padding: '20px 20px 16px 20px', flexShrink: 0, alignItems: 'center' }}>
				<Col xs={6}>
					<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
						<Icon icon="translate" style={{ color: '#5C7080' }} />
						<HTMLSelect
							value={currentLanguage}
							onChange={handleLanguageChange}
							options={AVAILABLE_LANGUAGES.map(lang => ({
								value: lang.code,
								label: lang.name,
							}))}
							minimal
							style={{ minWidth: '120px' }}
						/>
					</div>
				</Col>
				<Col xs={6}>
					<H3 key={langKey} className={Classes.TEXT_MUTED} style={{ textAlign: 'right', margin: 0 }}>
						{t('Privacy Notice: Analytics in This App')}
					</H3>
				</Col>
			</Row>
			<Divider style={{ flexShrink: 0 }} />
			<div className={Classes.DIALOG_BODY} style={{ padding: '20px', overflowY: 'auto', flex: '1 1 auto' }}>
				<TranslatedContent key={langKey} />
			</div>
			<Divider style={{ flexShrink: 0 }} />
			<div className="privacy-consent-buttons-container">
				<TranslatedButtons key={langKey} onAccept={onAccept} onOptOut={onOptOut} />
			</div>
		</Dialog>
	);
}

export default PrivacyConsentDialog;

