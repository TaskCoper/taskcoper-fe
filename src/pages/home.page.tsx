import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import type { I18nKey } from '@/lib/i18n/types'
import {
  ArrowRight,
  CalendarCheck,
  CheckCircle2,
  MessageSquareIcon,
  Sparkles,
  TrendingUp,
  UsersRoundIcon,
  Zap
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

const cardBaseClass =
  'w-64 xl:w-72 p-3 cursor-pointer bg-white/95 border-border/60 shadow-xl shadow-slate-200/50 transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-2xl hover:scale-105'

const customStyles = `
  /* Floating Animation (Up and Down) */
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-15px); }
  }

  /* Shooting Animation (From Center to Position) */
  @keyframes shootOut {
    0% {
      opacity: 0;
      transform: translate(var(--center-x), var(--center-y)) scale(0.4);
    }
    60% {
      opacity: 1;
      transform: translate(0, 0) scale(1.05);
    }
    100% {
      opacity: 1;
      transform: translate(0, 0) scale(1);
    }
  }

  .animate-float {
    animation: float 6s ease-in-out infinite;
    will-change: transform;
  }

  .card-wrapper {
    position: absolute;
    /* Calculated distance from center for the shooting effect */
    --center-x: 0px; 
    --center-y: 0px;
    
    animation: shootOut 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    animation-delay: var(--delay);
    opacity: 0; 
    z-index: 20;
  }
`

const stats: { value: string; label: I18nKey }[] = [
  { value: '10K+', label: 'home.stats.projects' },
  { value: '50K+', label: 'home.stats.tasksDone' },
  { value: '99.9%', label: 'home.stats.uptime' },
  { value: '24/7', label: 'home.stats.support' }
]

export default function HomePage() {
  const { t, i18n } = useTranslation()
  const sprintProgress = 75
  const sprintProgressLabel = new Intl.NumberFormat(i18n.language === 'vi' ? 'vi-VN' : 'en-US', {
    style: 'percent',
    maximumFractionDigits: 0
  }).format(sprintProgress / 100)

  return (
    <>
      <style>{customStyles}</style>
      <div className='h-full overflow-hidden flex flex-col'>
        {/* Hero Section */}
        <section className='flex-1 flex items-center justify-center pt-14 sm:pt-16 pb-4 relative'>
          {/* CONSTRAINT CONTAINER: Keeps cards close to text on large screens */}
          <div className='w-full max-w-400 mx-auto h-full relative flex items-center justify-center'>
            {/* Decorative Orbs */}
            <div className='absolute inset-0 overflow-hidden pointer-events-none'>
              <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 sm:w-225 h-150 bg-linear-to-br from-primary/8 via-teal-500/5 to-emerald-400/8 rounded-full blur-3xl' />
            </div>

            {/* --- LEFT SIDE CARDS (Hidden on screens smaller than 2xl) --- */}

            {/* 1. Top Left: Task Card */}
            <div
              className='hidden 2xl:block card-wrapper left-[8%] top-[10%]'
              style={{ '--center-x': '300px', '--center-y': '250px', '--delay': '0s' } as React.CSSProperties}
            >
              <div className='animate-float' style={{ animationDelay: '0s' }}>
                <div style={{ transform: 'rotate(-15deg)' }}>
                  <Card className={cardBaseClass}>
                    <CardContent className='p-0 space-y-3'>
                      <div className='flex items-start justify-between'>
                        <div className='flex items-center gap-2.5'>
                          <div className='size-8 rounded-lg bg-linear-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20'>
                            <CheckCircle2 className='size-4 text-white' />
                          </div>
                          <div>
                            <span className='text-sm font-semibold text-slate-800'>
                              {t('home.cards.taskCard.title')}
                            </span>
                            <p className='text-[10px] text-muted-foreground'>{t('home.cards.taskCard.subtitle')}</p>
                          </div>
                        </div>
                        <Badge
                          variant='outline'
                          className='bg-emerald-50 text-emerald-600 text-[10px] font-medium rounded-sm'
                        >
                          {t('home.cards.taskCard.status')}
                        </Badge>
                      </div>
                      <p className='text-xs text-slate-500 leading-relaxed'>{t('home.cards.taskCard.description')}</p>
                      <div className='flex items-center gap-2'>
                        <Badge
                          variant='outline'
                          className='text-[9px] px-1.5 py-0 h-4 border-orange-200 text-orange-600'
                        >
                          {t('home.cards.taskCard.priority')}
                        </Badge>
                        <span className='text-[9px] text-slate-400 inline-flex items-center gap-1'>
                          <MessageSquareIcon className='size-3.5' />
                          {t('home.cards.taskCard.comments', { count: 8 })}
                        </span>
                      </div>
                      <div className='pt-2 border-t border-slate-100 flex items-center justify-between'>
                        <div className='flex items-center gap-2'>
                          <div className='flex -space-x-2'>
                            {['bg-primary', 'bg-emerald-500', 'bg-teal-500'].map((bg, i) => (
                              <Avatar key={i} className='size-6 ring-2 ring-white'>
                                <AvatarFallback className={`${bg} text-[8px] text-white font-medium`}>
                                  {['JD', 'TN', 'KL'][i]}
                                </AvatarFallback>
                              </Avatar>
                            ))}
                          </div>
                          <span className='text-[10px] text-slate-400'>
                            {t('home.cards.taskCard.members', { count: 3 })}
                          </span>
                        </div>
                        <span className='text-[10px] text-slate-400 font-medium'>{t('home.cards.taskCard.date')}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>

            {/* 2. Middle Left: Messages */}
            <div
              className='hidden 2xl:block card-wrapper left-[2%] top-[45%]'
              style={{ '--center-x': '400px', '--center-y': '0px', '--delay': '0.1s' } as React.CSSProperties}
            >
              <div className='animate-float' style={{ animationDelay: '1s' }}>
                <div style={{ transform: 'rotate(-8deg)' }}>
                  <Card className={cardBaseClass}>
                    <CardContent className='p-0 space-y-3'>
                      <div className='flex items-start justify-between'>
                        <div className='flex items-center gap-2.5'>
                          <div className='size-8 rounded-lg bg-linear-to-br from-primary to-indigo-600 flex items-center justify-center shadow-lg shadow-primary/20'>
                            <MessageSquareIcon className='size-4 text-white' />
                          </div>
                          <span className='text-sm font-semibold text-slate-800'>{t('home.cards.teamChat.title')}</span>
                        </div>
                        <div className='bg-rose-500 text-white text-[10px] size-5 font-medium rounded-full flex items-center justify-center'>
                          5
                        </div>
                      </div>
                      <div className='space-y-2'>
                        <div className='flex items-start gap-2'>
                          <Avatar className='size-6 mt-0.5'>
                            <AvatarFallback className='bg-emerald-500 text-[8px] text-white'>AK</AvatarFallback>
                          </Avatar>
                          <div className='flex-1'>
                            <p className='text-[11px] text-slate-600'>{t('home.cards.teamChat.message')}</p>
                            <p className='text-[9px] text-slate-400'>{t('home.cards.teamChat.timeAgo')}</p>
                          </div>
                        </div>
                        <div className='flex items-start gap-2'>
                          <Avatar className='size-6 mt-0.5'>
                            <AvatarFallback className='bg-primary text-[8px] text-white'>JS</AvatarFallback>
                          </Avatar>
                          <div className='flex-1'>
                            <p className='text-[11px] text-slate-600'>{t('home.cards.teamChat.message2')}</p>
                            <p className='text-[9px] text-slate-400'>{t('home.cards.teamChat.timeAgo2')}</p>
                          </div>
                        </div>
                      </div>
                      <div className='pt-2 border-t border-slate-100 flex items-center justify-between'>
                        <span className='text-[9px] text-slate-400'>{t('home.cards.teamChat.typing')}</span>
                        <span className='text-[9px] text-primary font-medium'>{t('home.cards.teamChat.viewAll')}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>

            {/* 3. Bottom Left: Analytics */}
            <div
              className='hidden 2xl:block card-wrapper left-[10%] bottom-[8%]'
              style={{ '--center-x': '300px', '--center-y': '-200px', '--delay': '0.2s' } as React.CSSProperties}
            >
              <div className='animate-float' style={{ animationDelay: '2s' }}>
                <div style={{ transform: 'rotate(12deg)' }}>
                  <Card className={cardBaseClass}>
                    <CardContent className='p-0 space-y-3'>
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-2.5'>
                          <div className='size-8 rounded-lg bg-linear-to-br from-teal-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-teal-500/20'>
                            <TrendingUp className='size-4 text-white' />
                          </div>
                          <div>
                            <span className='text-sm font-semibold text-slate-800'>
                              {t('home.cards.productivity.title')}
                            </span>
                            <p className='text-[10px] text-emerald-500 font-medium'>
                              {t('home.cards.productivity.change')}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className='flex items-end gap-1 h-12 pt-1'>
                        {[35, 55, 40, 70, 50, 85, 65, 90, 75].map((h, i) => (
                          <div
                            key={i}
                            className='flex-1 bg-linear-to-t from-primary/80 to-emerald-400 rounded-t-sm transition-all hover:from-primary hover:to-emerald-500'
                            style={{ height: `${h}%` }}
                          />
                        ))}
                      </div>
                      <div className='flex justify-between text-[9px] text-slate-400 pt-1'>
                        <span>{t('home.cards.productivity.days.mon')}</span>
                        <span>{t('home.cards.productivity.days.wed')}</span>
                        <span>{t('home.cards.productivity.days.fri')}</span>
                        <span>{t('home.cards.productivity.days.sun')}</span>
                      </div>
                      <div className='pt-2 border-t border-slate-100 flex items-center justify-between'>
                        <span className='text-[9px] text-slate-500'>
                          {t('home.cards.productivity.tasksCompleted', { count: 47 })}
                        </span>
                        <span className='text-[9px] text-emerald-500 font-medium'>
                          {t('home.cards.productivity.streak', { days: 12 })}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>

            {/* --- RIGHT SIDE CARDS (Hidden on screens smaller than 2xl) --- */}

            {/* 4. Top Right: Team Activity */}
            <div
              className='hidden 2xl:block card-wrapper right-[8%] top-[12%]'
              style={{ '--center-x': '-300px', '--center-y': '200px', '--delay': '0.15s' } as React.CSSProperties}
            >
              <div className='animate-float' style={{ animationDelay: '0.5s' }}>
                <div style={{ transform: 'rotate(18deg)' }}>
                  <Card className={cardBaseClass}>
                    <CardContent className='p-0 space-y-3'>
                      <div className='flex items-start justify-between'>
                        <div className='flex items-center gap-2.5'>
                          <div className='size-8 rounded-lg bg-linear-to-br from-primary to-violet-600 flex items-center justify-center shadow-lg shadow-primary/20'>
                            <UsersRoundIcon className='size-4 text-white' />
                          </div>
                          <span className='text-sm font-semibold text-slate-800'>
                            {t('home.cards.teamActivity.title')}
                          </span>
                        </div>
                        <div className='flex items-center gap-1.5'>
                          <span className='size-2 bg-emerald-500 rounded-full animate-pulse' />
                          <span className='text-[10px] text-emerald-600 font-medium'>
                            {t('home.cards.teamActivity.live')}
                          </span>
                        </div>
                      </div>
                      <div className='space-y-2'>
                        <div className='flex items-center gap-2 text-[11px]'>
                          <Avatar className='size-5'>
                            <AvatarFallback className='bg-primary text-[7px] text-white'>A</AvatarFallback>
                          </Avatar>
                          <span className='text-slate-500'>
                            {t('home.cards.teamActivity.alexCompleted')}{' '}
                            <span className='text-slate-700 font-medium'>
                              {t('home.cards.teamActivity.apiIntegration')}
                            </span>
                          </span>
                        </div>
                        <div className='flex items-center gap-2 text-[11px]'>
                          <Avatar className='size-5'>
                            <AvatarFallback className='bg-emerald-500 text-[7px] text-white'>B</AvatarFallback>
                          </Avatar>
                          <span className='text-slate-500'>
                            {t('home.cards.teamActivity.bethStarted')}{' '}
                            <span className='text-slate-700 font-medium'>
                              {t('home.cards.teamActivity.codeReview')}
                            </span>
                          </span>
                        </div>
                      </div>
                      <div className='pt-2 border-t border-slate-100 flex items-center justify-between'>
                        <div className='flex -space-x-2'>
                          {['bg-primary', 'bg-emerald-500', 'bg-teal-500', 'bg-cyan-500', 'bg-violet-500'].map(
                            (bg, i) => (
                              <Avatar key={i} className='size-6 ring-2 ring-white'>
                                <AvatarFallback className={`${bg} text-[8px] text-white`}>
                                  {String.fromCharCode(65 + i)}
                                </AvatarFallback>
                              </Avatar>
                            )
                          )}
                        </div>
                        <span className='text-[10px] text-slate-400'>
                          {t('home.cards.teamActivity.online', { count: 12 })}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>

            {/* 5. Middle Right: Timeline */}
            <div
              className='hidden 2xl:block card-wrapper right-[3%] top-[48%]'
              style={{ '--center-x': '-400px', '--center-y': '0px', '--delay': '0.25s' } as React.CSSProperties}
            >
              <div className='animate-float' style={{ animationDelay: '1.5s' }}>
                <div style={{ transform: 'rotate(8deg)' }}>
                  <Card className={cardBaseClass}>
                    <CardContent className='p-0 space-y-3'>
                      <div className='flex items-center gap-2.5'>
                        <div className='size-8 rounded-lg bg-linear-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20'>
                          <CalendarCheck className='size-4 text-white' />
                        </div>
                        <div>
                          <span className='text-sm font-semibold text-slate-800'>{t('home.cards.timeline.title')}</span>
                          <p className='text-[10px] text-amber-600 font-medium'>
                            {t('home.cards.timeline.events', { count: 3 })}
                          </p>
                        </div>
                      </div>
                      {/* Timeline Events */}
                      <div className='space-y-2'>
                        <div className='flex gap-2'>
                          <div className='flex flex-col items-center'>
                            <div className='size-2 rounded-full bg-emerald-500' />
                            <div className='w-0.5 h-5 bg-slate-200' />
                          </div>
                          <div className='flex-1 -mt-0.5'>
                            <p className='text-[11px] font-medium text-slate-700'>
                              {t('home.cards.timeline.sprintReview')}
                            </p>
                            <p className='text-[9px] text-slate-400'>{t('home.cards.timeline.sprintReviewTime')}</p>
                          </div>
                        </div>
                        <div className='flex gap-2'>
                          <div className='flex flex-col items-center'>
                            <div className='size-2 rounded-full bg-primary animate-pulse' />
                            <div className='w-0.5 h-5 bg-slate-200' />
                          </div>
                          <div className='flex-1 -mt-0.5'>
                            <p className='text-[11px] font-medium text-slate-700'>
                              {t('home.cards.timeline.teamStandup')}
                            </p>
                            <p className='text-[9px] text-primary font-medium'>{t('home.cards.timeline.now')}</p>
                          </div>
                        </div>
                        <div className='flex gap-2'>
                          <div className='flex flex-col items-center'>
                            <div className='size-2 rounded-full bg-slate-300' />
                          </div>
                          <div className='flex-1 -mt-0.5'>
                            <p className='text-[11px] font-medium text-slate-500'>
                              {t('home.cards.timeline.designSync')}
                            </p>
                            <p className='text-[9px] text-slate-400'>{t('home.cards.timeline.designSyncAt')}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>

            {/* 6. Bottom Right: Sprint */}
            <div
              className='hidden 2xl:block card-wrapper right-[10%] bottom-[10%]'
              style={{ '--center-x': '-300px', '--center-y': '-200px', '--delay': '0.35s' } as React.CSSProperties}
            >
              <div className='animate-float' style={{ animationDelay: '2.5s' }}>
                <div style={{ transform: 'rotate(-12deg)' }}>
                  <Card className={cardBaseClass}>
                    <CardContent className='p-0 space-y-3'>
                      <div className='flex items-start justify-between'>
                        <div className='flex items-center gap-2.5'>
                          <div className='size-8 rounded-lg bg-linear-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20'>
                            <Zap className='size-4 text-white' />
                          </div>
                          <div>
                            <span className='text-sm font-semibold text-slate-800'>{t('home.cards.sprint.title')}</span>
                            <p className='text-[10px] text-slate-400'>
                              {t('home.cards.sprint.remaining', { count: 5 })}
                            </p>
                          </div>
                        </div>
                        <span className='text-lg font-bold text-primary'>{sprintProgressLabel}</span>
                      </div>
                      <Progress value={sprintProgress} className='h-2' />
                      <div className='grid grid-cols-3 gap-2 pt-1'>
                        <div className='text-center'>
                          <div className='text-sm font-bold text-slate-400'>12</div>
                          <div className='text-[9px] text-slate-400'>{t('home.cards.sprint.toDo')}</div>
                        </div>
                        <div className='text-center'>
                          <div className='text-sm font-bold text-amber-500'>8</div>
                          <div className='text-[9px] text-slate-400'>{t('home.cards.sprint.inProgress')}</div>
                        </div>
                        <div className='text-center'>
                          <div className='text-sm font-bold text-emerald-500'>24</div>
                          <div className='text-[9px] text-slate-400'>{t('home.cards.sprint.done')}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>

            {/* Main Content (Centered) */}
            <div className='relative z-30 max-w-4xl px-4 sm:px-6 text-center mx-auto'>
              <div className='inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium mb-5 sm:mb-8 animate-[fadeIn_0.5s_ease-out] border border-primary/20'>
                <Sparkles className='size-3' />
                <span className='text-primary text-xs font-semibold'>{t('home.hero.badge')}</span>
              </div>

              <div className='mb-5 sm:mb-6 space-y-2 animate-[fadeIn_0.6s_ease-out] text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight'>
                <h1 className='text-slate-900'>{t('home.hero.title')}</h1>

                <p className='bg-linear-to-r from-primary via-teal-500 to-emerald-500 bg-clip-text text-transparent'>
                  {t('home.hero.titleHighlight')}
                </p>
              </div>

              <p className='text-sm sm:text-base md:text-lg text-slate-600 max-w-xl mx-auto mb-8 sm:mb-10 leading-relaxed animate-[fadeIn_0.7s_ease-out]'>
                {t('home.hero.description')}
              </p>

              <div className='animate-[fadeIn_0.8s_ease-out]'>
                <Link to='/sign-up'>
                  <Button
                    size='lg'
                    className='w-full sm:w-auto bg-linear-to-r from-primary via-teal-500 to-emerald-500 hover:from-primary/90 hover:via-teal-500/90 hover:to-emerald-500/90 shadow-xl shadow-primary/30 hover:shadow-2xl hover:shadow-emerald-500/30 transition-all duration-300 group border-0'
                  >
                    {t('home.hero.cta')}
                    <ArrowRight className='size-4 group-hover:translate-x-1 transition-transform' />
                  </Button>
                </Link>
              </div>

              {/* Stats - Responsive Grid */}
              <div className='mt-10 sm:mt-14 grid grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-4 sm:gap-8 animate-[fadeIn_1s_ease-out]'>
                {stats.map((stat, index) => (
                  <div key={index} className='text-center'>
                    <p className='text-xl sm:text-3xl md:text-4xl font-bold bg-linear-to-r from-primary via-teal-500 to-emerald-500 bg-clip-text text-transparent'>
                      {stat.value}
                    </p>
                    <p className='text-[10px] sm:text-xs text-slate-500 mt-0.5'>{t(stat.label)}</p>
                  </div>
                ))}
              </div>

              {/* Trust Badge */}
              <div className='mt-8 sm:mt-10 flex items-center justify-center gap-2 text-xs text-slate-500 animate-[fadeIn_1.1s_ease-out]'>
                <div className='flex -space-x-1'>
                  {['bg-primary', 'bg-emerald-500', 'bg-teal-500'].map((bg, i) => (
                    <Avatar key={i} className='size-5 ring-2 ring-white'>
                      <AvatarFallback className={`${bg} text-[8px] text-white`}>
                        {String.fromCharCode(65 + i)}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                </div>
                <span>{t('home.hero.trustBadge')}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Footer Links */}
        <footer className='py-4 px-6 flex justify-center items-center gap-4 sm:gap-6 text-[10px] sm:text-xs z-50'>
          <Link to='/terms-of-service' className='hover:text-primary transition-colors'>
            {t('pageTitle.termsOfService')}
          </Link>
          <Separator orientation='vertical' className='h-3 bg-slate-200' />
          <Link to='/privacy-policy' className='hover:text-primary transition-colors'>
            {t('pageTitle.privacyPolicy')}
          </Link>
          <Separator orientation='vertical' className='h-3 bg-slate-200' />
          <p>{t('common.copyright.short', { year: new Date().getFullYear() })}</p>
        </footer>
      </div>
    </>
  )
}
