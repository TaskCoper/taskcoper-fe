import SanitizedHtml from '@/components/sanitized-html'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useGetMentorPackages } from '@/features/mentor-packages/hooks/use-get-mentor-packages'
import BookPackageDialog from '@/features/package-bookings/components/book-package-dialog'
import MentorSchedule from '@/features/schedules/components/mentor-schedule'
import { useAuthStore } from '@/lib/zustand/auth.store'
import { cn, formatCurrency } from '@/shared/utils'
import type { UserDetail } from '@/types/user.type'
import { BookOpenIcon, ChevronDownIcon } from 'lucide-react'
import { useCallback, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

const html =
  '<ul><li><p>Nền tảng quản trị toàn diện dành cho doanh nghiệp vừa và nhỏ (SME) - giải pháp số về quản trị cho doanh nghiệp giáo dục triển khai mô hình Project Based Learning.</p></li></ul><ul><li><p>Một hệ sinh thái toàn diện hỗ trợ quản lý – đánh giá – kết nối trong quá trình thực hiện dự án.</p></li></ul><h4><strong>TaskCoper: Quản Trị · Kết Nối · Bức Tốc</strong></h4><p>Nền tảng gồm 2 phiên bản chính, phục vụ hai nhóm đối tượng khác nhau nhưng cùng mục tiêu: tối ưu quản lý, nâng cao chất lượng dự án và kết nối nguồn lực.</p><p>Nỗi đau của thị trường:</p><ul><li><p>Đối với phiên bản dành cho môi trường thương mại:</p></li></ul><ul><li><p>90% Đa số các startup vừa và nhỏ thành lập và thất bại trong 2 năm đầu là do thiếu định hướng và môi trường kết nối.</p></li><li><p>Không phải tổ chức hay nhóm cá nhân nào cũng có mentor và người hướng dẫn ngay từ đầu để phát triển.</p></li><li><p>Quản lý dự án thiếu chi tiết, không biết cá nhân nào trong team đang đảm nhận những nhiệm vụ nào</p></li></ul><ul><li><p>Đối với phiên bản học thuật</p></li></ul><ul><li><p>Trong bối cảnh giáo dục hiện đại chuyển dịch mạnh mẽ theo hướng Project-Based Learning (PBL), sinh viên không chỉ học lý thuyết mà cần được trải nghiệm thực hành thông qua các dự án thực tế. Tuy nhiên, khi PBL trở thành xu hướng, một bài toán lớn cũng dần lộ diện: nhà trường và giảng viên thiếu công cụ quản lý dự án phù hợp cho môi trường học thuật – trong khi các nền tảng hiện có chủ yếu được thiết kế cho doanh nghiệp.</p></li><li><p>"Nỗi đau" của PBL trong môi trường đại học</p></li><li><p>Trên thực tế, giảng viên gặp khó khăn trong việc theo dõi tiến độ từng nhóm, đánh giá mức độ đóng góp của từng sinh viên hay phát hiện gian lận, đạo văn trong quá trình làm dự án. Nhà trường thiếu dữ liệu minh bạch để quản lý và chuẩn hóa chất lượng đào tạo. Còn sinh viên, dù học theo dự án, vẫn chưa thực sự được làm việc trong một môi trường mô phỏng đúng chuẩn quản lý chuyên nghiệp, thiếu kết nối xuyên suốt với giảng viên.</p></li></ul><hr><h1><strong>1. Phiên bản dành cho môi trường Học Thuật - Tổ chức giáo dục</strong></h1><p>Nền tảng quản lý dự án theo mô hình Project-Based Learning (PBL), giúp nhà trường, giảng viên và sinh viên vận hành – theo dõi – đánh giá toàn bộ quá trình thực hiện dự án.</p><h2><strong>Đối tượng sử dụng</strong></h2><ul><li><p>Nhà trường, khoa, trung tâm đào tạo</p></li><li><p>Giảng viên, giáo viên</p></li><li><p>Học sinh – sinh viên</p></li></ul><h2><strong>Lợi ích cho Nhà trường</strong></h2><ul><li><p>Quản lý tập trung toàn bộ dự án của sinh viên (khởi nghiệp, đồ án, môn học).</p></li><li><p>Theo dõi tiến độ, báo cáo, kết quả học tập theo thời gian thực.</p></li><li><p>Quản lý và điều phối giảng viên theo từng dự án/ngành học.</p></li><li><p>Hệ thống đánh giá minh bạch, đồng nhất theo chuẩn PBL.</p></li><li><p>Thống kê số liệu giúp nâng cao chất lượng đào tạo và kiểm định.</p></li></ul><h2><strong>Lợi ích cho Giảng viên</strong></h2><ul><li><p>Theo dõi trực quan tiến độ của từng nhóm sinh viên.</p></li><li><p>Quản lý sự đóng góp cá nhân của từng thành viên.</p></li><li><p>Công cụ AI hỗ trợ tóm tắt báo cáo, phân tích rủi ro, đề xuất cải thiện.</p></li><li><p>Quản lý nhiều nhóm dễ dàng (task, lịch, meeting, tài liệu,...).</p></li><li><p>Gợi ý nhận xét – đánh giá – rubric tự động.</p></li></ul><h2><strong>Lợi ích cho Sinh viên</strong></h2><ul><li><p>Hệ thống quản lý dự án chuẩn chuyên nghiệp (task, milestone, timeline).</p></li><li><p>Kết nối với bạn học, giảng viên và mentor dễ dàng (chat, đặt lịch meeting).</p></li><li><p>AI tư vấn cá nhân hoá theo dự án: hướng dẫn nhiệm vụ, gợi ý tài liệu, tóm tắt yêu cầu.</p></li><li><p>Hồ sơ năng lực (Portfolio) tự động xây dựng từ các dự án đã làm.</p></li></ul><hr><h1><strong>2. Phiên bản Thương Mại (Cá nhân, Startup và SME)</strong></h1><p>Nền tảng kết nối Startup – SMEs – Mentor, giúp tối ưu vận hành dự án và thúc đẩy tăng trưởng.</p><h2><strong>Đối tượng sử dụng</strong></h2><ul><li><p>Cá nhân/ nhóm nhỏ Freelancer&nbsp;</p></li><li><p>Startup giai đoạn early-stage</p></li><li><p>SMEs muốn scale-up</p></li><li><p>Mentor chuyên môn (kinh doanh, công nghệ, vận hành...)</p></li></ul><h2><strong>Lợi ích cho Startup và SME</strong></h2><ul><li><p>Quản lý toàn diện các dự án phát triển sản phẩm, marketing, growth.</p></li><li><p>Tối ưu hiệu suất teamwork: phân công, theo dõi, báo cáo, KPI.</p></li><li><p>Kết nối mentor chuyên nghiệp (chat, đặt lịch meeting).</p></li><li><p>AI cố vấn doanh nghiệp: phân tích mô hình kinh doanh, gợi ý chiến lược, dự đoán rủi ro.</p></li></ul><h2><strong>Lợi ích cho Mentor</strong></h2><ul><li><p>Tiếp cận các dự án tiềm năng phù hợp chuyên môn.</p></li><li><p>Tạo nguồn thu nhập thụ động hoặc cố định.</p></li><li><p>Dashboard theo dõi các nhóm đang hỗ trợ và quản lý lịch.</p></li><li><p>Tăng uy tín cá nhân thông qua hệ thống đánh giá minh bạch.</p></li><li><p>Xây dự Profile của Mentor.</p></li></ul><hr><h1><strong>Giá trị cốt lõi của nền tảng</strong></h1><ul><li><p>Giảm 50–70% thời gian quản lý dự án cho giảng viên và doanh nghiệp.</p></li><li><p>Tăng tốc độ hoàn thành dự án bằng quy trình rõ ràng, minh bạch.</p></li><li><p>Kết nối đúng người – đúng nhu cầu: giảng viên, sinh viên, mentor, startup, doanh nghiệp.</p></li><li><p>Tích hợp AI để hỗ trợ tự động hoá tối đa.</p></li></ul><p></p>'

const COLLAPSED_HEIGHT = 300

interface AllTabProps {
  userDetail?: UserDetail
}

export default function AllTab({ userDetail }: AllTabProps) {
  const { t } = useTranslation()
  const { user } = useAuthStore()

  const isMentor = userDetail?.role === 'Mentor'
  const isHidden = user?.UserId === userDetail?.id

  const [isExpanded, setIsExpanded] = useState(false)
  const [needsCollapse, setNeedsCollapse] = useState(false)

  const contentRef = useRef<HTMLDivElement>(null)

  const { mentorPackages } = useGetMentorPackages({ mentorId: userDetail?.id, enabled: isMentor })

  const measureRef = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      const observer = new ResizeObserver(() => {
        setNeedsCollapse(node.scrollHeight > COLLAPSED_HEIGHT)
      })
      observer.observe(node)
      return () => observer.disconnect()
    }
  }, [])

  return (
    <div className='space-y-4 pb-20'>
      {isMentor ? (
        <div className='flex gap-4 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]'>
          {mentorPackages.value.items.map((pkg) => (
            <Card
              key={pkg.id}
              className='shrink-0 w-[calc((100%-8rem)/3)] min-w-[calc((100%-8rem)/3)] rounded-lg p-0 gap-0 shadow-none'
            >
              <div className='px-3 py-2 flex items-center gap-1'>
                <p className='font-semibold text-primary truncate'>{pkg.name}</p>
                <div className='flex-1' />
                <Badge className='rounded-md' variant='secondary'>
                  <p className='font-semibold text-xs'>
                    {t('mentorPackage.card.sessionsCount', { count: pkg.totalSessions })}
                  </p>
                </Badge>
              </div>

              <Separator />

              <div className='p-4'>
                <p className='text-xs text-muted-foreground italic'>{pkg.description}</p>
              </div>

              <div className='px-2 pb-2'>
                {isHidden ? (
                  <Link to={`/mentor-packages/${pkg.id}`}>
                    <Button className='w-full'>{t('mentorPackage.card.viewPackage')}</Button>
                  </Link>
                ) : (
                  <BookPackageDialog mentorPackage={pkg}>
                    <Button className='w-full'>
                      {t('mentorPackage.card.bookFor', { price: formatCurrency(pkg.price, pkg.currency) })}
                    </Button>
                  </BookPackageDialog>
                )}
              </div>
            </Card>
          ))}
        </div>
      ) : null}

      {isMentor ? <MentorSchedule userId={userDetail?.id} /> : null}

      <div className='grid grid-cols-12 gap-4'>
        <div className='col-span-12'>
          <Card className='w-full text-sm sm:text-base text-left p-0 shadow-none gap-0 overflow-hidden rounded-lg'>
            <div className='px-3 py-2 flex items-center gap-2 bg-muted/60 rounded-t-xl'>
              <BookOpenIcon className='size-4 text-muted-foreground' />
              <p className='text-sm font-semibold text-muted-foreground'>{t('project.info.readme')}</p>
            </div>
            <Separator />

            <div className='relative'>
              <div
                ref={(node) => {
                  contentRef.current = node
                  measureRef(node)
                }}
                className={cn('p-4 overflow-hidden transition-[max-height] duration-300 ease-in-out')}
                style={{
                  maxHeight: !isExpanded && needsCollapse ? `${COLLAPSED_HEIGHT}px` : undefined
                }}
              >
                <SanitizedHtml html={html} />
              </div>

              {needsCollapse && !isExpanded && (
                <div className='absolute bottom-0 left-0 right-0 h-24 bg-linear-to-t from-background to-transparent pointer-events-none' />
              )}
            </div>

            {needsCollapse && (
              <div className='flex justify-center border-t border-border/50 py-1.5'>
                <Button
                  variant='ghost'
                  size='sm'
                  className='text-xs text-muted-foreground gap-1.5 hover:text-foreground'
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                  {isExpanded ? t('common.ui.viewLess') : t('common.ui.viewMore')}
                  <ChevronDownIcon
                    className={cn('size-3.5 transition-transform duration-200', isExpanded && 'rotate-180')}
                  />
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
