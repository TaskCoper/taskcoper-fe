import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import InfoTab from '@/features/mentor-packages/components/tabs/info-tab'
import PackageFeedbacksTab from '@/features/mentor-packages/components/tabs/package-feedbacks-tab'
import PackageRulesTab from '@/features/mentor-packages/components/tabs/package-rules-tab'
import PackageStatisticsTab from '@/features/mentor-packages/components/tabs/package-statistics-tab'
import { useDeleteMentorPackage } from '@/features/mentor-packages/hooks/use-delete-mentor-package'
import { useGetMentorPackage } from '@/features/mentor-packages/hooks/use-get-mentor-package'
import { useUpdateMentorPackage } from '@/features/mentor-packages/hooks/use-update-mentor-package'
import type { UpdateMentorPackageFormValues } from '@/features/mentor-packages/validations'
import { useUploadFileWithToast } from '@/hooks/use-upload-file-with-toast'
import { useConfirmStore } from '@/lib/zustand/confirm.store'
import { PackageIcon } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { type SubmitHandler } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams, useSearchParams } from 'react-router'

const MentorPackageSkeleton = () => (
  <div className='absolute inset-0 flex flex-col overflow-hidden'>
    <div className='bg-muted/50 px-6 pt-6 space-y-4'>
      <div className='flex items-center gap-2 h-4'>
        <Skeleton className='h-4 w-24' />
        <div className='h-3 w-px bg-muted-foreground/20 rotate-12 mx-0.5' />
        <Skeleton className='h-4 w-32' />
      </div>

      <div className='flex items-center gap-2'>
        <Skeleton className='size-6 rounded-md' />
        <Skeleton className='h-8 w-64' />
      </div>

      <div className='flex gap-2 border-b'>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className='w-40 px-4 pb-3 pt-2'>
            <Skeleton className='h-5 w-full' />
          </div>
        ))}
      </div>
    </div>

    <div className='px-6 pt-6 space-y-6 overflow-auto'>
      <div className='max-w-7xl mx-auto w-full space-y-6 pb-10'>
        <div className='space-y-2'>
          <Skeleton className='h-7 w-48' />
          <Skeleton className='h-4 w-96' />
        </div>

        <div className='space-y-4'>
          <div className='space-y-2'>
            <Skeleton className='h-4 w-32' />
            <Skeleton className='h-48 w-full rounded-xl' />
            <Skeleton className='h-3 w-64' />
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            {[1, 2].map((i) => (
              <div key={i} className='space-y-2'>
                <Skeleton className='h-4 w-20' />
                <Skeleton className='h-10 w-full' />
              </div>
            ))}
          </div>

          <div className='space-y-2'>
            <Skeleton className='h-4 w-20' />
            <Skeleton className='h-24 w-full' />
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
            {[1, 2, 3].map((i) => (
              <div key={i} className='space-y-2'>
                <Skeleton className='h-4 w-20' />
                <Skeleton className='h-10 w-full' />
              </div>
            ))}
          </div>

          <div className='flex justify-end gap-2'>
            <Skeleton className='h-9 w-24' />
            <Skeleton className='h-9 w-24' />
          </div>
        </div>
      </div>
    </div>
  </div>
)

export default function MentorPackagePage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { t } = useTranslation()
  const { packageId } = useParams<{ packageId: string }>()
  const { confirm } = useConfirmStore()
  const { methods, updateMentorPackage, isUpdatingMentorPackage } = useUpdateMentorPackage()
  const { uploadFileWithToast, isUploading } = useUploadFileWithToast()
  const { deleteMentorPackage, isDeletingMentorPackage } = useDeleteMentorPackage()
  const [pendingCoverFile, setPendingCoverFile] = useState<File | null>(null)
  const [pendingCoverPreview, setPendingCoverPreview] = useState<string | null>(null)

  const currentTab = searchParams.get('tab') || 'info'

  const { mentorPackage, isLoadingMentorPackage } = useGetMentorPackage({ packageId })
  const coverImageUrl = methods.watch('coverImageUrl')

  useEffect(() => {
    if (mentorPackage) {
      methods.reset({
        mentorPackageId: mentorPackage.id,
        name: mentorPackage.name,
        description: mentorPackage.description,
        totalSessions: mentorPackage.totalSessions.toString(),
        price: mentorPackage.price.toString(),
        currency: mentorPackage.currency,
        coverImageUrl: mentorPackage.coverImageUrl,
        isActive: mentorPackage.isActive,
        isPin: mentorPackage.isPin,
        activationDeadlineDays: mentorPackage.activationDeadlineDays,
        usageDeadlineDays: mentorPackage.usageDeadlineDays
      })
    }
  }, [mentorPackage, methods])

  useEffect(() => {
    return () => {
      if (pendingCoverPreview) {
        URL.revokeObjectURL(pendingCoverPreview)
      }
    }
  }, [pendingCoverPreview])

  const handleCoverImageChange = useCallback(
    (file: File | null) => {
      if (pendingCoverPreview) {
        URL.revokeObjectURL(pendingCoverPreview)
      }

      if (!file) {
        setPendingCoverFile(null)
        setPendingCoverPreview(null)
        methods.setValue('coverImageUrl', mentorPackage?.coverImageUrl ?? null, {
          shouldValidate: true,
          shouldDirty: true,
          shouldTouch: true
        })
        return
      }

      const previewUrl = URL.createObjectURL(file)
      setPendingCoverFile(file)
      setPendingCoverPreview(previewUrl)
      methods.setValue('coverImageUrl', previewUrl, {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true
      })
    },
    [methods, mentorPackage?.coverImageUrl, pendingCoverPreview]
  )

  const handleDelete = useCallback(async () => {
    if (!mentorPackage) return

    const ok = await confirm({
      title: t('mentorPackage.delete.title'),
      description: t('mentorPackage.delete.description', {
        packageName: mentorPackage.name
      }),
      confirmText: t('common.button.delete'),
      cancelText: t('common.button.cancel'),
      variant: 'destructive'
    })

    if (!ok) return

    deleteMentorPackage(
      { mentorPackageId: mentorPackage.id },
      {
        onSuccess: () => navigate('/packages')
      }
    )
  }, [confirm, mentorPackage, deleteMentorPackage, navigate, t])

  const onSubmit: SubmitHandler<UpdateMentorPackageFormValues> = useCallback(
    async (values) => {
      let coverImageUrl = values.coverImageUrl

      const shouldUploadPendingCover =
        Boolean(pendingCoverFile) && Boolean(pendingCoverPreview) && values.coverImageUrl === pendingCoverPreview

      if (shouldUploadPendingCover && pendingCoverFile) {
        const uploadedUrl = await uploadFileWithToast({
          file: pendingCoverFile,
          showSuccessToast: false,
          renderProgress: (progress) => (
            <div className='w-72 space-y-1'>
              <Progress value={progress} className='w-full' />
              <p className='text-xs text-muted-foreground'>{progress}%</p>
            </div>
          )
        })

        if (!uploadedUrl) return

        coverImageUrl = uploadedUrl
      }

      updateMentorPackage(
        {
          body: {
            ...values,
            coverImageUrl
          }
        },
        {
          onSuccess: () => {
            if (pendingCoverPreview) {
              URL.revokeObjectURL(pendingCoverPreview)
            }

            setPendingCoverPreview(null)
            setPendingCoverFile(null)
          }
        }
      )
    },
    [pendingCoverFile, pendingCoverPreview, uploadFileWithToast, updateMentorPackage]
  )

  const TABS = useMemo(
    () => [
      {
        value: 'info',
        label: t('mentorPackage.page.infoTitle'),
        content: (
          <InfoTab
            methods={methods}
            coverImageUrl={coverImageUrl}
            onSubmit={onSubmit}
            onDelete={handleDelete}
            onCoverImageChange={handleCoverImageChange}
            isDeleting={isDeletingMentorPackage}
            isUpdating={isUpdatingMentorPackage}
            isUploading={isUploading}
          />
        )
      },
      {
        value: 'rules',
        label: t('mentorPackage.page.durationTitle'),
        content: <PackageRulesTab mentorPackageId={mentorPackage?.id} rules={mentorPackage?.rules} />
      },
      {
        value: 'feedbacks',
        label: t('mentorPackage.page.feedbackTitle'),
        content: <PackageFeedbacksTab />
      },
      {
        value: 'statistics',
        label: t('mentorPackageStatistics.title'),
        content: <PackageStatisticsTab />
      }
    ],
    [
      t,
      methods,
      coverImageUrl,
      onSubmit,
      handleDelete,
      handleCoverImageChange,
      isDeletingMentorPackage,
      isUpdatingMentorPackage,
      isUploading,
      mentorPackage
    ]
  )

  const handleBack = useCallback(() => {
    navigate('/packages')
  }, [navigate])

  if (isLoadingMentorPackage) {
    return (
      <div className='absolute inset-0 overflow-auto'>
        <MentorPackageSkeleton />
      </div>
    )
  }

  return (
    <div className='absolute inset-0 flex flex-col overflow-hidden'>
      <Tabs
        value={currentTab}
        onValueChange={(value) => setSearchParams({ tab: value })}
        className='flex flex-1 flex-col min-h-0'
      >
        <div className='bg-muted/50 px-6 pt-6 space-y-4'>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink onClick={handleBack} className='cursor-pointer'>
                  {t('mentorPackage.page.title')}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className='truncate max-w-75'>{t('mentorPackage.page.manage')}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className='flex items-center gap-2'>
            <PackageIcon className='size-6 text-primary' />
            <p className='text-2xl font-bold'>{mentorPackage?.name}</p>
          </div>

          <TabsList className='w-full justify-start rounded-none border-b p-0 bg-transparent gap-2 overflow-x-auto flex-nowrap [&::-webkit-scrollbar]:hidden'>
            {TABS.map((tab) => (
              <TabsTrigger
                key={tab.value}
                className='w-40 flex-none shrink-0 relative rounded-none border-b-2 border-b-transparent bg-transparent px-4 pb-3 pt-2 font-medium text-muted-foreground shadow-none transition-none focus-visible:ring-0 data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none data-[state=active]:bg-transparent data-[state=active]:font-semibold'
                value={tab.value}
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {TABS.map((tab) => (
          <TabsContent key={tab.value} className='px-6 pt-3 overflow-auto' value={tab.value}>
            {tab.content}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
