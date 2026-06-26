import AsyncMultiSelectField from '@/components/async-multi-select-field'
import RichTextEditor from '@/components/rich-text-editor'
import SanitizedHtml from '@/components/sanitized-html'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { useUploadFileWithToast } from '@/hooks/use-upload-file-with-toast'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { cn } from '@/shared/utils'
import { ArrowLeftIcon, EyeIcon, FileTextIcon, ImageIcon, SendIcon, UploadIcon, XIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Controller, FormProvider, useFieldArray } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router'
import { useGetArticle } from '../features/article/hooks/use-get-article'
import { useGetCategoryNews } from '../features/article/hooks/use-get-category-news'
import { useUpdateArticle } from '../features/article/hooks/use-update-article'
import { ArticleStatus, type CategoryResponse } from '../features/article/types'
import type { AddArticleForm, CategoryFormItem } from '../features/article/validations'

const ARTICLE_FORM_PREFIX = 'articles.form' as const
const ARTICLE_STATUS_PREFIX = 'articles.status' as const

interface ComboboxCategoryItem {
  id: string
  name: string
}

const getArticleStatusValue = (status: ArticleStatus) => (status === ArticleStatus.Published ? 1 : 0)

const getArticleCategories = (article: { categories: CategoryResponse[] }): CategoryFormItem[] => {
  return article.categories.map((category) => ({
    id: category.categoryId,
    name: category.categoryName
  }))
}

export default function NewsUpdatePage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { t } = useTenantTranslation()
  const { article } = useGetArticle(id)
  const { methods, onSubmit, isUpdatingArticle } = useUpdateArticle(article?.id)
  const { categoryNews, isLoadingCategory } = useGetCategoryNews()
  const [categorySearch, setCategorySearch] = useState('')
  const { uploadFileWithToast, isUploading } = useUploadFileWithToast()
  const pictureFileInputRef = useRef<HTMLInputElement>(null)

  const { fields, remove, replace } = useFieldArray({
    control: methods.control,
    name: 'categories'
  })

  const pictureUrl = methods.watch('pictureUrl')
  const title = methods.watch('title')
  const description = methods.watch('description')
  const status = methods.watch('status')

  const categoryItems: ComboboxCategoryItem[] = categoryNews.value.items.map((u) => ({
    id: u.categoryId,
    name: u.title
  }))

  useEffect(() => {
    if (!article) return

    const mappedCategories = getArticleCategories(article)

    methods.reset({
      title: article.title ?? '',
      description: article.description ?? '',
      pictureUrl: article.pictureUrl ?? '',
      status: getArticleStatusValue(article.status),
      categories: mappedCategories
    })
  }, [article, methods])

  const onBackToArticles = () => {
    navigate('/htm/news')
  }

  const statusLabel = status === 1 ? t(`${ARTICLE_STATUS_PREFIX}.published`) : t(`${ARTICLE_STATUS_PREFIX}.draft`)
  const isSubmitDisabled = isUpdatingArticle || !id || isUploading

  return (
    <div className='h-full overflow-y-auto flex flex-col gap-4 p-4 max-w-5xl mx-auto'>
      <div className='flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
        <div>
          <p className='text-2xl font-bold'>{t(`${ARTICLE_FORM_PREFIX}.updateTitle`)}</p>
          <p className='text-sm text-muted-foreground'>{t(`${ARTICLE_FORM_PREFIX}.updateDescription`)}</p>
        </div>

        <Button type='button' variant='outline' size='sm' onClick={onBackToArticles} disabled={isUpdatingArticle}>
          <ArrowLeftIcon data-icon='inline-start' />
          {t('common.button.back')}
        </Button>
      </div>

      <FormProvider {...methods}>
        <form
          onSubmit={methods.handleSubmit(onSubmit)}
          className='grid min-h-0 flex-1 gap-10 xl:grid-cols-[minmax(0,1fr)_360px]'
        >
          <FieldGroup className='gap-2'>
            <Controller
              name='title'
              control={methods.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className='gap-1'>
                  <FieldLabel htmlFor={field.name} className='gap-0.5'>
                    {t(`${ARTICLE_FORM_PREFIX}.titleLabel`)}
                    <span className='font-semibold text-destructive'>*</span>
                  </FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    placeholder={t(`${ARTICLE_FORM_PREFIX}.titlePlaceholder`)}
                    // value={article?.title}
                    aria-invalid={fieldState.invalid}
                    autoFocus
                  />
                  <div className='min-h-4'>
                    {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
                  </div>
                </Field>
              )}
            />

            <div className='space-y-2'>
              <AsyncMultiSelectField<AddArticleForm, CategoryFormItem, ComboboxCategoryItem>
                name='categories'
                items={categoryItems}
                isLoading={isLoadingCategory}
                searchValue={categorySearch}
                onSearchChange={setCategorySearch}
                onChange={(val) => replace(val)}
                label={t(`${ARTICLE_FORM_PREFIX}.categoriesLabel`)}
                placeholder={t('common.ui.selectOptions')}
                isRequired
                displayError={false}
                getId={(category) => category.id}
                getValueId={(category) => category.id}
                getLabel={(category) => category.name}
                createValue={(category) => ({
                  id: category.id,
                  name: category.name
                })}
                renderOption={(category) => (
                  <div className='flex min-w-0 flex-col'>
                    <p className='truncate text-sm font-medium'>{category.name}</p>
                  </div>
                )}
              />

              <div className='flex items-center gap-2'>
                {fields.map((field, index) => (
                  <Badge key={field.id}>
                    {field.name}
                    <XIcon className='size-3 cursor-pointer' onClick={() => remove(index)} />
                  </Badge>
                ))}
              </div>
            </div>

            <Controller
              name='description'
              control={methods.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className='min-h-0 flex-1 gap-1'>
                  <FieldLabel className='gap-0.5'>
                    {t(`${ARTICLE_FORM_PREFIX}.bodyLabel`)}
                    <span className='font-semibold text-destructive'>*</span>
                  </FieldLabel>
                  <div>
                    <RichTextEditor
                      content={field.value ?? ''}
                      onChange={field.onChange}
                      compact
                      invalid={fieldState.invalid}
                      error={fieldState.error}
                      className='min-h-96'
                    />
                  </div>
                </Field>
              )}
            />
          </FieldGroup>

          <div className='flex flex-col justify-between gap-4'>
            <Card className='gap-3'>
              <CardHeader>
                <CardTitle>{t(`${ARTICLE_FORM_PREFIX}.publishTitle`)}</CardTitle>
                <CardDescription>{t(`${ARTICLE_FORM_PREFIX}.publishDescription`)}</CardDescription>
              </CardHeader>

              <CardContent>
                <FieldGroup className='gap-2'>
                  <Controller
                    name='status'
                    control={methods.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid} className='gap-1'>
                        <FieldLabel htmlFor={field.name}>{t(`${ARTICLE_FORM_PREFIX}.statusLabel`)}</FieldLabel>
                        <Select value={String(field.value)} onValueChange={(value) => field.onChange(Number(value))}>
                          <SelectTrigger id={field.name} className='w-full' aria-invalid={fieldState.invalid}>
                            <SelectValue placeholder={t(`${ARTICLE_FORM_PREFIX}.statusPlaceholder`)} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectItem value='0'>{t(`${ARTICLE_STATUS_PREFIX}.draft`)}</SelectItem>
                              <SelectItem value='1'>{t(`${ARTICLE_STATUS_PREFIX}.published`)}</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                        <div className='min-h-4'>
                          {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
                        </div>
                      </Field>
                    )}
                  />

                  <Controller
                    name='pictureUrl'
                    control={methods.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid} className='gap-1'>
                        <FieldLabel className='gap-0.5'>
                          {t(`${ARTICLE_FORM_PREFIX}.pictureLabel`)}
                          <span className='font-semibold text-destructive'>*</span>
                        </FieldLabel>
                        <input
                          type='file'
                          accept='image/*'
                          className='hidden'
                          ref={pictureFileInputRef}
                          onChange={async (e) => {
                            const file = e.target.files?.[0]
                            if (!file) return
                            e.target.value = ''
                            const url = await uploadFileWithToast({ file, showSuccessToast: false })
                            if (url) field.onChange(url)
                          }}
                        />
                        <button
                          type='button'
                          className={cn(
                            'relative flex w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-lg border border-dashed transition-colors',
                            fieldState.invalid ? 'border-destructive' : 'border-border',
                            field.value ? 'aspect-video p-0' : 'h-24 hover:bg-muted/50'
                          )}
                          onClick={() => pictureFileInputRef.current?.click()}
                          disabled={isUploading}
                        >
                          {field.value ? (
                            <>
                              <img src={field.value} alt='' className='size-full object-cover' />
                              <div className='absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity'>
                                {isUploading ? (
                                  <Spinner className='size-5 text-white' />
                                ) : (
                                  <UploadIcon className='size-5 text-white' />
                                )}
                              </div>
                            </>
                          ) : (
                            <div className='flex flex-col items-center gap-1 text-muted-foreground'>
                              {isUploading ? <Spinner className='size-5' /> : <ImageIcon className='size-5' />}
                              <span className='text-xs'>
                                {isUploading ? t('common.ui.uploading') : t('common.button.upload')}
                              </span>
                            </div>
                          )}
                        </button>
                        <div className='min-h-4'>
                          {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
                        </div>
                      </Field>
                    )}
                  />
                </FieldGroup>
              </CardContent>

              <CardFooter className='flex-wrap justify-end gap-2'>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button type='button' variant='outline' disabled={isUpdatingArticle}>
                      <EyeIcon data-icon='inline-start' />
                      {t(`${ARTICLE_FORM_PREFIX}.previewTitle`)}
                    </Button>
                  </DialogTrigger>
                  <DialogContent position='top-center' className='sm:max-w-2xl'>
                    <DialogHeader>
                      <DialogTitle>{t(`${ARTICLE_FORM_PREFIX}.previewTitle`)}</DialogTitle>
                      <DialogDescription>{t(`${ARTICLE_FORM_PREFIX}.previewDescription`)}</DialogDescription>
                    </DialogHeader>

                    <div className='flex flex-col gap-4'>
                      {pictureUrl ? (
                        <img
                          src={pictureUrl}
                          alt={t(`${ARTICLE_FORM_PREFIX}.previewImageAlt`)}
                          className='aspect-video w-full rounded-lg border object-cover'
                        />
                      ) : (
                        <div className='flex aspect-video w-full items-center justify-center rounded-lg border bg-muted text-muted-foreground'>
                          <ImageIcon />
                        </div>
                      )}

                      <div className='flex flex-col gap-3'>
                        <div className='flex items-center gap-2'>
                          <Badge variant='secondary'>{statusLabel}</Badge>
                          <Badge variant='outline'>
                            {t(`${ARTICLE_FORM_PREFIX}.categoryCount`, { count: categoryNews.value.totalCount })}
                          </Badge>
                        </div>

                        <div className='flex items-start gap-2'>
                          <FileTextIcon className='mt-0.5 shrink-0 text-muted-foreground' />
                          <div className='min-w-0 flex-1'>
                            <p className='truncate text-base font-semibold'>
                              {title.trim() || t(`${ARTICLE_FORM_PREFIX}.previewUntitled`)}
                            </p>
                            <p className='text-xs text-muted-foreground'>{t(`${ARTICLE_FORM_PREFIX}.previewHint`)}</p>
                          </div>
                        </div>

                        {description.trim() ? (
                          <div className='max-h-80 overflow-auto rounded-lg border bg-background p-4'>
                            <SanitizedHtml html={description} className='max-w-none overflow-visible' />
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button type='submit' disabled={isSubmitDisabled}>
                  {isUpdatingArticle ? <Spinner data-icon='inline-start' /> : <SendIcon data-icon='inline-start' />}
                  {t(`${ARTICLE_FORM_PREFIX}.updateSubmit`)}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </form>
      </FormProvider>
    </div>
  )
}
