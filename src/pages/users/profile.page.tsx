import FileDropzone from '@/components/file-dropzone'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useGetMe } from '@/features/auth/hooks/use-get-me'
import UpdateMentorShortBioDialog from '@/features/mentors/components/dialogs/update-mentor-short-bio-dialog'
import AllTab from '@/features/users/components/tabs/all-tab'
import MentorPackagesTab from '@/features/users/components/tabs/mentor-packages-tab'
import ScheduleTab from '@/features/users/components/tabs/schedule-tab'
import { useGetUser } from '@/features/users/hooks/use-get-user'
import { useUpdateMe } from '@/features/users/hooks/use-update-me'
import { Role } from '@/features/users/types'
import { useUploadFileWithToast } from '@/hooks/use-upload-file-with-toast'
import { queryKeys } from '@/lib/query-keys'
import { MAX_AVATAR_SIZE, MAX_COVER_SIZE, UNDERLINE_TAB_CLASSNAME } from '@/shared/constants'
import { cn } from '@/shared/utils'
import { useQueryClient } from '@tanstack/react-query'
import { BadgeCheckIcon, CameraIcon, GlobeIcon, ImageOffIcon, MailIcon, PhoneIcon, XIcon } from 'lucide-react'
import { parseAsString, useQueryState } from 'nuqs'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router'

type TabValue = 'all' | 'schedule' | 'projects' | 'packages'

interface TabItem {
  id: number
  label: string
  value: TabValue
  content: React.ReactNode
  roles: Role[]
}

export default function ProfilePage() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const { userIdentifier } = useParams<{ userIdentifier: string }>()

  const { me, isGettingMe } = useGetMe()
  const { user, isGettingUser } = useGetUser({ userIdentifier })
  const { updateMe, isUpdatingMe } = useUpdateMe()
  const { uploadFileWithToast, isUploading } = useUploadFileWithToast()

  const [pendingAvatarPreview, setPendingAvatarPreview] = useState<string | null>(null)
  const [pendingCoverPreview, setPendingCoverPreview] = useState<string | null>(null)
  const [isAvatarPopoverOpen, setIsAvatarPopoverOpen] = useState(false)
  const [isCoverPopoverOpen, setIsCoverPopoverOpen] = useState(false)

  const isViewingOwnProfile = Boolean(me && user && me.id === user.id)
  const isUpdatingProfileImage = isUploading || isUpdatingMe
  const isUpdatingAvatar = isUpdatingProfileImage
  const isUpdatingCover = isUpdatingProfileImage
  const displayAvatar = pendingAvatarPreview ?? user?.avatar
  const displayCoverImage = pendingCoverPreview ?? user?.coverImageUrl

  const uploadAndUpdateProfileImage = useCallback(
    async ({
      file,
      currentPreview,
      setPreview,
      buildImagePayload
    }: {
      file: File | null
      currentPreview: string | null
      setPreview: React.Dispatch<React.SetStateAction<string | null>>
      buildImagePayload: (uploadedUrl: string) => { avatar: string | null; coverImageUrl: string | null }
    }) => {
      if (!file || !user || !isViewingOwnProfile || isUpdatingProfileImage) return

      if (currentPreview) {
        URL.revokeObjectURL(currentPreview)
      }

      const previewUrl = URL.createObjectURL(file)
      setPreview(previewUrl)

      const uploadedUrl = await uploadFileWithToast({
        file,
        renderProgress: (progress) => (
          <div className='w-72 space-y-1'>
            <Progress value={progress} className='w-full' />
            <p className='text-xs text-muted-foreground'>{progress}%</p>
          </div>
        )
      })

      if (!uploadedUrl) {
        setPreview(null)
        URL.revokeObjectURL(previewUrl)
        return
      }

      updateMe(
        {
          body: {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phoneNumber: user.phoneNumber,
            address: user.address,
            city: user.city,
            state: user.state,
            domainIds: user.domains.map((domain) => domain.id),
            timeZone: user.timeZone,
            ...buildImagePayload(uploadedUrl)
          }
        },
        {
          onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(userIdentifier) })
            setPreview(null)
            URL.revokeObjectURL(previewUrl)
          },
          onError: () => {
            setPreview(null)
            URL.revokeObjectURL(previewUrl)
          }
        }
      )
    },
    [user, isViewingOwnProfile, isUpdatingProfileImage, uploadFileWithToast, updateMe, queryClient, userIdentifier]
  )

  const handleAvatarChange = useCallback(
    (file: File | null) => {
      uploadAndUpdateProfileImage({
        file,
        currentPreview: pendingAvatarPreview,
        setPreview: setPendingAvatarPreview,
        buildImagePayload: (avatar) => ({
          avatar,
          coverImageUrl: user?.coverImageUrl ?? null
        })
      })
    },
    [uploadAndUpdateProfileImage, pendingAvatarPreview, user?.coverImageUrl]
  )

  const handleCoverImageChange = useCallback(
    (file: File | null) => {
      uploadAndUpdateProfileImage({
        file,
        currentPreview: pendingCoverPreview,
        setPreview: setPendingCoverPreview,
        buildImagePayload: (coverImageUrl) => ({
          avatar: user?.avatar ?? null,
          coverImageUrl
        })
      })
    },
    [uploadAndUpdateProfileImage, pendingCoverPreview, user?.avatar]
  )

  const handleRemoveAvatar = useCallback(() => {
    if (!user || !isViewingOwnProfile || isUpdatingProfileImage) return

    updateMe(
      {
        body: {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          address: user.address,
          city: user.city,
          state: user.state,
          domainIds: user.domains.map((domain) => domain.id),
          avatar: null,
          coverImageUrl: user.coverImageUrl,
          timeZone: user.timeZone
        }
      },
      {
        onSuccess: async () => {
          await queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(userIdentifier) })
          setPendingAvatarPreview(null)
        }
      }
    )
  }, [user, isViewingOwnProfile, isUpdatingProfileImage, updateMe, queryClient, userIdentifier])

  const handleRemoveCoverImage = useCallback(() => {
    if (!user || !isViewingOwnProfile || isUpdatingProfileImage) return

    updateMe(
      {
        body: {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          address: user.address,
          city: user.city,
          state: user.state,
          domainIds: user.domains.map((domain) => domain.id),
          avatar: user.avatar,
          coverImageUrl: null,
          timeZone: user.timeZone
        }
      },
      {
        onSuccess: async () => {
          await queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(userIdentifier) })
          setPendingCoverPreview(null)
        }
      }
    )
  }, [user, isViewingOwnProfile, isUpdatingProfileImage, updateMe, queryClient, userIdentifier])

  useEffect(() => {
    return () => {
      if (pendingAvatarPreview) {
        URL.revokeObjectURL(pendingAvatarPreview)
      }

      if (pendingCoverPreview) {
        URL.revokeObjectURL(pendingCoverPreview)
      }
    }
  }, [pendingAvatarPreview, pendingCoverPreview])

  useEffect(() => {
    if (user) {
      document.title = `${user.firstName} ${user.lastName} | TaskCoper`
    }
  }, [user])

  const tabs: TabItem[] = useMemo(() => {
    const items: TabItem[] = [
      {
        id: 1,
        label: t('user.tabs.all'),
        value: 'all',
        content: <AllTab userDetail={user} />,
        roles: [Role.Mentor, Role.User, Role.Lecturer, Role.Admin]
      },
      {
        id: 50,
        label: t('user.tabs.schedule'),
        value: 'schedule',
        content: <ScheduleTab userDetail={user} />,
        roles: [Role.Lecturer, Role.Admin]
      },
      {
        id: 100,
        label: t('user.tabs.schedule'),
        value: 'schedule',
        content: <ScheduleTab userDetail={user} />,
        roles: [Role.Mentor]
      },
      {
        id: 150,
        label: t('user.tabs.packages'),
        value: 'packages',
        content: <MentorPackagesTab userDetail={user} />,
        roles: [Role.Mentor]
      }
    ]

    return items.filter((tab) => {
      if (!user) return true
      return tab.roles.includes(user.role)
    })
  }, [t, user])

  const [activeTabValue, setActiveTabValue] = useQueryState('tab', parseAsString.withDefault('all'))

  const activeTab = useMemo(() => {
    return tabs.find((tab) => tab.value === activeTabValue) || tabs[0]
  }, [tabs, activeTabValue])

  if (isGettingUser || isGettingMe) {
    return (
      <div className='w-full h-full overflow-y-auto'>
        <div className='bg-muted/60'>
          <div className='h-60 sm:h-72 lg:h-96 max-w-330 mx-auto px-4'>
            <Skeleton className='size-full rounded-b-2xl' />
          </div>

          <div className='max-w-315 mx-auto px-4'>
            <div className='mt-6 flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6'>
              <Skeleton className='size-32 lg:size-40 rounded-full shrink-0' />

              <div className='w-full flex flex-col items-center sm:items-start mt-2 space-y-3'>
                <Skeleton className='h-8 sm:h-9 w-48 sm:w-64' />

                <div className='flex flex-wrap justify-center sm:justify-start items-center gap-2'>
                  <Skeleton className='h-5 w-32' />
                  <Skeleton className='hidden sm:block h-4 w-px' />
                  <Skeleton className='h-5 w-28' />
                  <Skeleton className='hidden sm:block h-4 w-px' />
                  <Skeleton className='h-5 w-24' />
                </div>

                <Skeleton className='h-4 w-full max-w-md' />
              </div>
            </div>

            <Separator className='bg-foreground/10 mt-6' />

            <div className='pt-1'>
              <div className='flex gap-4 pb-1 overflow-x-auto'>
                <Skeleton className='h-9 w-16 sm:w-20 rounded-md' />
                <Skeleton className='h-9 w-16 sm:w-20 rounded-md' />
                <Skeleton className='h-9 w-20 sm:w-24 rounded-md' />
                <Skeleton className='h-9 w-16 sm:w-20 rounded-md' />
              </div>
            </div>
          </div>
        </div>

        <div className='w-full max-w-315 mx-auto py-4 px-4'>
          <div className='pb-20 grid grid-cols-12 gap-4'>
            <div className='col-span-3 space-y-12'>
              <div className='space-y-2'>
                <div className='flex items-center gap-2'>
                  <Skeleton className='size-5 rounded-full' />
                  <Skeleton className='h-4 w-16' />
                </div>
                <div className='flex items-center flex-wrap gap-1'>
                  <Skeleton className='h-5 w-16 rounded-sm' />
                  <Skeleton className='h-5 w-20 rounded-sm' />
                  <Skeleton className='h-5 w-14 rounded-sm' />
                </div>
              </div>
            </div>

            <div className='col-span-9 space-y-4'>
              <Skeleton className='h-100 w-full rounded-lg' />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Tabs className='w-full h-full overflow-y-auto' value={activeTab.value} onValueChange={setActiveTabValue}>
      <div className='bg-muted/60'>
        <div className='h-60 sm:h-72 lg:h-96 max-w-330 mx-auto px-4'>
          {isViewingOwnProfile ? (
            <Popover open={isCoverPopoverOpen} onOpenChange={setIsCoverPopoverOpen}>
              <PopoverTrigger asChild>
                <button
                  type='button'
                  disabled={isUpdatingCover}
                  className='cursor-pointer size-full relative rounded-b-2xl overflow-hidden group/cover disabled:cursor-not-allowed'
                >
                  {displayCoverImage ? (
                    <img
                      src={displayCoverImage}
                      alt={t('user.coverImageAlt', { name: `${user?.firstName} ${user?.lastName}` })}
                      className='size-full object-cover'
                    />
                  ) : (
                    <div className='size-full flex items-center justify-center bg-linear-to-t from-muted-foreground/20 via-muted-foreground/10 to-muted' />
                  )}

                  <div className='absolute inset-0 bg-black/20 opacity-0 transition-opacity duration-200 group-hover/cover:opacity-100 pointer-events-none' />
                  <div className='absolute bottom-3 right-3 pointer-events-none'>
                    <Button variant='secondary' size='sm' asChild>
                      <div>
                        <CameraIcon />
                        <p>{t('user.profile.addCoverImage')}</p>
                      </div>
                    </Button>
                  </div>
                </button>
              </PopoverTrigger>

              <PopoverContent className='w-80 p-1.5' align='end'>
                <div className='space-y-0.5'>
                  <FileDropzone
                    onFileChange={(file) => {
                      handleCoverImageChange(file)
                      setIsCoverPopoverOpen(false)
                    }}
                    className='w-full'
                    maxSize={MAX_COVER_SIZE}
                    disabled={isUpdatingCover}
                    accept={{
                      'image/png': ['.png'],
                      'image/jpeg': ['.jpg', '.jpeg'],
                      'image/webp': ['.webp'],
                      'image/svg+xml': ['.svg']
                    }}
                  >
                    <Button
                      type='button'
                      variant='ghost'
                      size='sm'
                      className='w-full justify-start'
                      disabled={isUpdatingCover}
                    >
                      <CameraIcon />
                      {t('user.profile.chooseCoverImage')}
                    </Button>
                  </FileDropzone>

                  {displayCoverImage ? (
                    <Button
                      type='button'
                      variant='ghost'
                      size='sm'
                      className='w-full justify-start text-destructive hover:text-destructive'
                      disabled={isUpdatingCover}
                      onClick={() => {
                        handleRemoveCoverImage()
                        setIsCoverPopoverOpen(false)
                      }}
                    >
                      <XIcon />
                      {t('user.profile.deleteCoverImage')}
                    </Button>
                  ) : null}
                </div>
              </PopoverContent>
            </Popover>
          ) : (
            <div className='size-full relative'>
              {displayCoverImage ? (
                <img
                  src={displayCoverImage}
                  alt={t('user.coverImageAlt', { name: `${user?.firstName} ${user?.lastName}` })}
                  className='size-full object-cover rounded-b-2xl'
                />
              ) : (
                <div className='size-full rounded-b-2xl flex items-center justify-center bg-linear-to-t from-muted-foreground/20 via-muted-foreground/10 to-muted' />
              )}
            </div>
          )}
        </div>

        <div className='max-w-315 mx-auto px-4'>
          <div className='mt-6 flex flex-col space-y-2'>
            <div className='flex flex-col sm:flex-row items-center gap-4 sm:gap-6'>
              {isViewingOwnProfile ? (
                <Popover open={isAvatarPopoverOpen} onOpenChange={setIsAvatarPopoverOpen}>
                  <PopoverTrigger asChild>
                    <button type='button' disabled={isUpdatingAvatar} className='relative cursor-pointer'>
                      <div className='size-32 lg:size-40 rounded-full bg-muted overflow-hidden shrink-0 relative group/avatar disabled:cursor-not-allowed'>
                        {displayAvatar ? (
                          <img
                            src={displayAvatar}
                            alt={t('user.logoImageAlt', { name: `${user?.firstName} ${user?.lastName}` })}
                            className='size-full object-cover rounded-full'
                          />
                        ) : (
                          <div className='size-full flex items-center justify-center'>
                            <ImageOffIcon className='size-8 text-muted-foreground' />
                          </div>
                        )}

                        <div className='absolute inset-0 rounded-full bg-black/20 opacity-0 transition-opacity duration-200 group-hover/avatar:opacity-100 pointer-events-none' />
                      </div>

                      <div className='p-1.5 rounded-full bg-slate-200 absolute bottom-1 right-2 z-10 flex justify-center items-center pointer-events-none'>
                        <CameraIcon className='size-5.5' />
                      </div>
                    </button>
                  </PopoverTrigger>

                  <PopoverContent className='w-80 p-1.5' align='center' sideOffset={10}>
                    <div className='space-y-0.5'>
                      <FileDropzone
                        onFileChange={(file) => {
                          handleAvatarChange(file)
                          setIsAvatarPopoverOpen(false)
                        }}
                        className='w-full'
                        maxSize={MAX_AVATAR_SIZE}
                        disabled={isUpdatingAvatar}
                        accept={{
                          'image/png': ['.png'],
                          'image/jpeg': ['.jpg', '.jpeg'],
                          'image/webp': ['.webp'],
                          'image/svg+xml': ['.svg']
                        }}
                      >
                        <Button
                          type='button'
                          variant='ghost'
                          size='sm'
                          className='w-full justify-start'
                          disabled={isUpdatingAvatar}
                        >
                          <CameraIcon />
                          {t('user.profile.chooseAvatar')}
                        </Button>
                      </FileDropzone>

                      {displayAvatar ? (
                        <Button
                          type='button'
                          variant='ghost'
                          size='sm'
                          className='w-full justify-start text-destructive hover:text-destructive'
                          disabled={isUpdatingAvatar}
                          onClick={() => {
                            handleRemoveAvatar()
                            setIsAvatarPopoverOpen(false)
                          }}
                        >
                          <XIcon />
                          {t('user.profile.deleteAvatar')}
                        </Button>
                      ) : null}
                    </div>
                  </PopoverContent>
                </Popover>
              ) : (
                <div className='size-32 lg:size-40 rounded-full bg-muted overflow-hidden shrink-0'>
                  {displayAvatar ? (
                    <img
                      src={displayAvatar}
                      alt={t('user.logoImageAlt', { name: `${user?.firstName} ${user?.lastName}` })}
                      className='size-full object-cover rounded-full'
                    />
                  ) : (
                    <div className='size-full flex items-center justify-center'>
                      <ImageOffIcon className='size-8 text-muted-foreground' />
                    </div>
                  )}
                </div>
              )}

              <div className='w-full flex flex-col items-center sm:items-start mt-2'>
                <div className='flex flex-col sm:flex-row items-center gap-2 sm:gap-3 mb-2 sm:mb-0'>
                  <p className='text-2xl sm:text-3xl font-semibold wrap-break-word text-center sm:text-left'>
                    {user?.firstName} {user?.lastName}
                  </p>

                  {user?.mentor && (
                    <div className='flex items-center gap-1.5 bg-primary px-1.5 py-1 rounded-md'>
                      <BadgeCheckIcon className='size-3.5 text-white' />
                      <p className='text-xs text-white font-medium'>{t('user.profile.verifiedByTaskCoper')}</p>
                    </div>
                  )}
                </div>

                <div className='flex flex-wrap justify-center sm:justify-start items-center gap-2 mb-2'>
                  {user?.email ? (
                    <div className='flex items-center gap-1.5'>
                      <MailIcon className='size-3.5' />
                      <p className='text-sm text-foreground/80'>{user?.email}</p>
                    </div>
                  ) : (
                    <p className='text-sm text-muted-foreground'>{t('user.profile.noEmail')}</p>
                  )}

                  <div className='hidden sm:block w-px h-4 bg-muted-foreground/50' />

                  {user?.phoneNumber ? (
                    <div className='flex items-center gap-1.5'>
                      <PhoneIcon className='size-3.5' />
                      <p className='text-sm text-foreground/80'>{user?.phoneNumber}</p>
                    </div>
                  ) : (
                    <p className='text-sm text-muted-foreground'>{t('user.profile.noPhoneNumber')}</p>
                  )}

                  <div className='hidden sm:block w-px h-4 bg-muted-foreground/50' />

                  <div className='flex items-center gap-1.5'>
                    <GlobeIcon className='size-3.5' />
                    <p className='text-sm text-foreground/80'>{user?.timeZone}</p>
                  </div>
                </div>

                {user?.mentor &&
                  (isViewingOwnProfile ? (
                    <UpdateMentorShortBioDialog user={user}>
                      <button
                        type='button'
                        className='text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm'
                      >
                        <p
                          className={cn(
                            'line-clamp-2 text-[14.5px] text-foreground/60 italic text-center sm:text-left',
                            'hover:bg-muted-foreground/10 cursor-pointer rounded-sm px-1 -mx-1'
                          )}
                        >
                          {user.mentor.shortBio}
                        </p>
                      </button>
                    </UpdateMentorShortBioDialog>
                  ) : (
                    <p className='line-clamp-2 text-[14.5px] text-foreground/60 italic text-center sm:text-left'>
                      {user.mentor.shortBio}
                    </p>
                  ))}
              </div>
            </div>

            <Separator className='bg-foreground/10 mt-4' />

            <div className='pt-1'>
              <TabsList className={cn(UNDERLINE_TAB_CLASSNAME.TabList, 'w-fit border-b-transparent')}>
                {tabs.map((tab) => (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.value}
                    className={cn(UNDERLINE_TAB_CLASSNAME.TabTrigger, 'data-[state=active]:bg-transparent')}
                  >
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
          </div>
        </div>
      </div>

      <div className='w-full max-w-315 mx-auto py-4'>
        {tabs.map((tab) => (
          <TabsContent key={tab.id} value={tab.value} className='px-4'>
            {tab.content}
          </TabsContent>
        ))}
      </div>
    </Tabs>
  )
}
