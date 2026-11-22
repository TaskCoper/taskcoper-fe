import { Button } from '@/components/ui/button'
import WorkspacePreview from '@/features/home/components/workspace-preview'
import '@/features/home/home.css'
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Check,
  CheckCheck,
  CircleCheck,
  Flag,
  Layers,
  ListTodo,
  MessageSquare,
  MoveUpRight,
  Users
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

function FeatureIllustration({ kind }: { kind: 'tasks' | 'progress' | 'team' }) {
  const { t } = useTranslation()
  if (kind === 'tasks')
    return (
      <div className='home-feature-art tasks-art' aria-hidden='true'>
        <div className='home-mini-task'>
          <span className='home-mini-check'>
            <Check />
          </span>
          <span>{t('home.landing.features.organization.sampleOne')}</span>
          <span className='home-mini-person violet'>{'L'}</span>
        </div>
        <div className='home-mini-task highlighted'>
          <span className='home-mini-circle' />
          <span>{t('home.landing.features.organization.sampleTwo')}</span>
          <span className='home-mini-person blue'>{'M'}</span>
        </div>
        <div className='home-mini-task'>
          <span className='home-mini-circle' />
          <span>{t('home.landing.features.organization.sampleThree')}</span>
          <span className='home-mini-person amber'>{'A'}</span>
        </div>
      </div>
    )
  if (kind === 'progress')
    return (
      <div className='home-feature-art progress-art' aria-hidden='true'>
        <div className='home-mini-timeline-label'>{t('home.landing.features.progress.sample')}</div>
        <div className='home-mini-timeline-grid'>
          <span className='home-mini-timeline-line' />
          <div className='home-mini-bar first' />
          <div className='home-mini-bar second' />
          <div className='home-mini-bar third' />
          <span className='home-mini-today'>{t('home.landing.features.progress.today')}</span>
          <span className='home-mini-milestone'>
            <Flag />
          </span>
        </div>
      </div>
    )
  return (
    <div className='home-feature-art team-art' aria-hidden='true'>
      <div className='home-mini-message'>
        <span className='home-mini-person violet'>{'L'}</span>
        <div>
          <strong>{t('home.landing.features.collaboration.sampleName')}</strong>
          <p>{t('home.landing.features.collaboration.sampleMessage')}</p>
        </div>
      </div>
      <div className='home-mini-message reply'>
        <span className='home-mini-person mint'>{'M'}</span>
        <div>
          <strong>{t('home.landing.features.collaboration.replyName')}</strong>
          <p>
            {t('home.landing.features.collaboration.replyMessage')}
            <CheckCheck />
          </p>
        </div>
      </div>
      <span className='home-mini-comment'>
        <MessageSquare />
        {t('home.landing.features.collaboration.sampleHint')}
      </span>
    </div>
  )
}

export default function HomePage() {
  const { t, i18n } = useTranslation()
  const isVietnamese = i18n.resolvedLanguage?.startsWith('vi')
  const features = [
    {
      kind: 'tasks' as const,
      icon: ListTodo,
      number: '01',
      title: t('home.landing.features.organization.title'),
      description: t('home.landing.features.organization.description')
    },
    {
      kind: 'progress' as const,
      icon: Flag,
      number: '02',
      title: t('home.landing.features.progress.title'),
      description: t('home.landing.features.progress.description')
    },
    {
      kind: 'team' as const,
      icon: Users,
      number: '03',
      title: t('home.landing.features.collaboration.title'),
      description: t('home.landing.features.collaboration.description')
    }
  ]
  const steps = [
    {
      number: '01',
      title: t('home.landing.workflow.steps.create.title'),
      description: t('home.landing.workflow.steps.create.description')
    },
    {
      number: '02',
      title: t('home.landing.workflow.steps.organize.title'),
      description: t('home.landing.workflow.steps.organize.description')
    },
    {
      number: '03',
      title: t('home.landing.workflow.steps.deliver.title'),
      description: t('home.landing.workflow.steps.deliver.description')
    }
  ]
  return (
    <div className='home-page'>
      <section className='home-hero' aria-labelledby='home-title'>
        <div className='home-container'>
          <div className='home-hero-content'>
            <div className='home-hero-copy'>
              <div className='home-eyebrow'>
                <span />
                {t('home.landing.hero.eyebrow')}
              </div>
              <h1 id='home-title'>
                {t('home.landing.hero.title')}
                <br />
                <span>
                  {t('home.landing.hero.titleAccent')}
                  <svg viewBox='0 0 600 18' preserveAspectRatio='none' aria-hidden='true'>
                    <path d='M4 12C139 1 389 0 595 8' />
                  </svg>
                </span>
              </h1>
              <p className='home-hero-description'>{t('home.landing.hero.description')}</p>
              <div className='home-hero-actions'>
                <Button asChild className='home-primary-action'>
                  <Link to='/sign-up'>
                    {t('home.landing.hero.cta')}
                    <ArrowUpRight />
                  </Link>
                </Button>
                <a className='home-secondary-action' href='#product'>
                  {t('home.landing.hero.secondaryCta')}
                  <ArrowDown />
                </a>
              </div>
              <div className='home-hero-notes'>
                <span>
                  <Check />
                  {t('home.landing.hero.noteOne')}
                </span>
                <span>
                  <Check />
                  {t('home.landing.hero.noteTwo')}
                </span>
              </div>
            </div>
            <div className='home-hero-aside' aria-hidden='true'>
              <div className='home-orbit-label'>
                {t('home.landing.hero.asideEyebrow')}
                <MoveUpRight />
              </div>
              <div className='home-focus-card'>
                <div className='home-focus-icon'>
                  <Layers />
                </div>
                <span>{t('home.landing.hero.asideTitle')}</span>
                <strong>{t('home.landing.hero.asideValue')}</strong>
                <div className='home-focus-avatars'>
                  <span className='home-mini-person violet'>{'L'}</span>
                  <span className='home-mini-person blue'>{'M'}</span>
                  <span className='home-mini-person amber'>{'A'}</span>
                  <div className='home-focus-line' />
                  <CircleCheck />
                </div>
              </div>
              <span className='home-aside-caption'>{t('home.landing.hero.asideCaption')}</span>
            </div>
          </div>
          <WorkspacePreview />
          <div className='home-principles'>
            <span>
              <Layers />
              {t('home.landing.principles.clarity')}
            </span>
            <span>
              <Users />
              {t('home.landing.principles.connection')}
            </span>
            <span>
              <CircleCheck />
              {t('home.landing.principles.progress')}
            </span>
          </div>
        </div>
      </section>

      <section className='home-features' id='features' aria-labelledby='home-features-title'>
        <div className='home-container'>
          <div className='home-section-heading'>
            <div>
              <p className='home-section-kicker'>{t('home.landing.features.eyebrow')}</p>
              <h2 id='home-features-title'>
                {t('home.landing.features.title')}
                <br />
                <span>{t('home.landing.features.titleAccent')}</span>
              </h2>
            </div>
            <p>{t('home.landing.features.description')}</p>
          </div>
          <div className='home-feature-grid'>
            {features.map((feature) => (
              <article className='home-feature' key={feature.kind}>
                <FeatureIllustration kind={feature.kind} />
                <div className='home-feature-body'>
                  <span className='home-feature-number'>
                    {feature.number}
                    <feature.icon />
                  </span>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className='home-workflow' id='workflow' aria-labelledby='home-workflow-title'>
        <div className='home-container home-workflow-grid'>
          <div className='home-workflow-copy'>
            <p className='home-section-kicker'>{t('home.landing.workflow.eyebrow')}</p>
            <h2 id='home-workflow-title'>{t('home.landing.workflow.title')}</h2>
            <p>{t('home.landing.workflow.description')}</p>
            <a className='home-text-link' href='#product'>
              {t('home.landing.workflow.cta')}
              <ArrowUpRight />
            </a>
          </div>
          <ol className='home-steps'>
            {steps.map((step) => (
              <li key={step.number}>
                <span className='home-step-number'>{step.number}</span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
                <ArrowUpRight aria-hidden='true' />
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className='home-final-section' aria-labelledby='home-final-title'>
        <div className='home-container'>
          <div className='home-final-cta'>
            <div className='home-final-decoration' aria-hidden='true'>
              <span />
              <span />
              <span />
            </div>
            <div>
              <p className='home-section-kicker'>{t('home.landing.closing.eyebrow')}</p>
              <h2 id='home-final-title'>{t('home.landing.closing.title')}</h2>
              <p>{t('home.landing.closing.description')}</p>
            </div>
            <Button asChild className='home-final-button'>
              <Link to='/sign-up'>
                {t('home.landing.closing.cta')}
                <ArrowRight />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className='home-footer'>
        <div className='home-container'>
          <div className='home-footer-top'>
            <div>
              <Link to='/' className='home-brand-lockup' aria-label={t('common.alt.logo')}>
                <img src='/images/taskcoper.png' alt={t('common.alt.logo')} width='112' height='32' />
              </Link>
              <p>{t('home.landing.footer.tagline')}</p>
            </div>
            <div className='home-footer-links'>
              <Link to='/terms-of-service'>{t('pageTitle.termsOfService')}</Link>
              <Link to='/privacy-policy'>{t('pageTitle.privacyPolicy')}</Link>
              <button
                type='button'
                onClick={() => void i18n.changeLanguage(isVietnamese ? 'en' : 'vi')}
                aria-label={t('home.landing.footer.changeLanguage')}
              >
                {isVietnamese ? t('language.english') : t('language.vietnamese')}
                <ArrowUpRight />
              </button>
            </div>
          </div>
          <div className='home-footer-bottom'>
            <span>{t('common.copyright.short', { year: new Date().getFullYear() })}</span>
            <span>{t('home.landing.footer.note')}</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
