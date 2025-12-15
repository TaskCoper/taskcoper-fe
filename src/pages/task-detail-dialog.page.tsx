import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import {
  ChevronDownIcon,
  ClockIcon,
  EyeIcon,
  ImageIcon,
  MessageSquareText,
  MoreHorizontalIcon,
  PaperclipIcon,
  SquareCheckBigIcon,
  TagIcon,
  TextAlignStartIcon,
  UserRoundPlusIcon,
  XIcon
} from 'lucide-react'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'

export default function TaskDetailDialogPage() {
  const { projectId, taskId } = useParams<{ projectId: string; taskId: string }>()

  const [open, setOpen] = useState(true)

  const navigate = useNavigate()

  const handleClose = () => {
    setOpen(false)
    setTimeout(() => {
      navigate(`/projects/${projectId}/tasks`)
    }, 300)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        showCloseButton={false}
        position='top-center'
        className='md:min-w-3xl lg:min-w-5xl xl:min-w-6xl p-0 gap-0'
        onInteractOutside={handleClose}
      >
        <VisuallyHidden>
          <DialogHeader>
            <DialogTitle>Task Detail</DialogTitle>
            <DialogDescription>Task Description</DialogDescription>
          </DialogHeader>
        </VisuallyHidden>
        <div className='px-6 py-4 flex items-center justify-between gap-2'>
          <Button size='sm' variant='secondary'>
            {taskId}
            <ChevronDownIcon />
          </Button>

          <div className='flex items-center gap-1'>
            <Button className='rounded-full' variant='ghost' size='icon-sm'>
              <EyeIcon />
            </Button>

            <Separator orientation='vertical' />

            <Button className='rounded-full' variant='ghost' size='icon-sm'>
              <ImageIcon />
            </Button>

            <Button className='rounded-full' variant='ghost' size='icon-sm'>
              <MoreHorizontalIcon />
            </Button>

            <Button className='rounded-full' variant='ghost' size='icon-sm' onClick={handleClose}>
              <XIcon />
            </Button>
          </div>
        </div>
        <Separator />
        <div className='grid grid-cols-12'>
          <div className='col-span-7 p-6 border-r border-border'>
            <div className='flex gap-3'>
              <Checkbox className='rounded-full border-foreground mt-2' />
              <div className='space-y-6'>
                <p className='text-3xl font-bold'>Tags Or Done</p>

                {/* Action Buttons */}
                <div className='flex items-center gap-2 flex-wrap'>
                  <Button variant='outline' size='sm'>
                    <TagIcon />
                    Nhãn
                  </Button>
                  <Button variant='outline' size='sm'>
                    <ClockIcon />
                    Ngày
                  </Button>
                  <Button variant='outline' size='sm'>
                    <SquareCheckBigIcon />
                    Việc cần làm
                  </Button>
                  <Button variant='outline' size='sm'>
                    <UserRoundPlusIcon />
                    Thành viên
                  </Button>
                  <Button variant='outline' size='sm'>
                    <PaperclipIcon />
                    Đính kèm
                  </Button>
                </div>
              </div>
            </div>

            <div className='flex gap-3 mt-10'>
              <TextAlignStartIcon className='mt-1 size-4' />
              <div className='w-full'>
                <p className='font-semibold'>Mô tả</p>

                <Textarea placeholder='Thêm mô tả chi tiết hơn...' className='resize-none w-full font-semibold mt-4' />
              </div>
            </div>
          </div>

          <div className='col-span-5 p-6 bg-muted'>
            <div className='flex items-center gap-2 mb-4'>
              <MessageSquareText className='size-4' />
              <p className='text-sm font-bold'>Nhận xét và hoạt động</p>
            </div>

            <Input
              placeholder='Viết bình luận...'
              className='font-semibold bg-background'
              // value={comment}
              // onChange={(e) => setComment(e.target.value)}
              // onKeyDown={(e) => {
              //   if (e.key === 'Enter') {
              //     handleCreateCommment()
              //   }
              // }}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
