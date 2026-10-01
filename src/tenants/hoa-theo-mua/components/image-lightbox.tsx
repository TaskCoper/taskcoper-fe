import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import Lightbox from 'yet-another-react-lightbox'
import Captions from 'yet-another-react-lightbox/plugins/captions'
import Counter from 'yet-another-react-lightbox/plugins/counter'
import Fullscreen from 'yet-another-react-lightbox/plugins/fullscreen'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'
import 'yet-another-react-lightbox/plugins/captions.css'
import 'yet-another-react-lightbox/plugins/counter.css'
import 'yet-another-react-lightbox/styles.css'

export interface ImageLightboxSlide {
  src: string
  alt?: string
  // Chú thích hiện dưới ảnh, bật/tắt được bằng nút của plugin Captions
  description?: string
}

// Một chỗ duy nhất giữ cấu hình xem ảnh phóng to: zoom, toàn màn hình, đếm ảnh và nhãn tiếng Việt.
// Trang nào cũng chỉ cần nắm `index` (null là đang đóng) rồi truyền danh sách ảnh vào.
const ImageLightbox = ({
  slides,
  index,
  onIndexChange,
  label,
  gallery
}: {
  slides: ImageLightboxSlide[]
  index: number | null
  onIndexChange: (index: number | null) => void
  // Nhãn riêng của từng màn (vd. "Xem ảnh thiệp"); bỏ trống thì dùng nhãn chung
  label?: string
  gallery?: string
}) => {
  const { t } = useTenantTranslation()

  if (slides.length === 0) return null

  // Một ảnh thì không có gì để lật, giấu luôn hai nút mũi tên
  const isSingleSlide = slides.length === 1

  return (
    <Lightbox
      open={index !== null}
      close={() => onIndexChange(null)}
      index={index ?? 0}
      on={{ view: ({ index: viewedIndex }) => onIndexChange(viewedIndex) }}
      slides={slides}
      plugins={[Captions, Counter, Fullscreen, Zoom]}
      captions={{ showToggle: true, descriptionTextAlign: 'start' }}
      counter={{ separator: ' / ' }}
      zoom={{ scrollToZoom: true, maxZoomPixelRatio: 3 }}
      labels={{
        Previous: t('lightbox.previous'),
        Next: t('lightbox.next'),
        Close: t('lightbox.close'),
        Lightbox: label ?? t('lightbox.label'),
        'Photo gallery': gallery ?? t('lightbox.gallery'),
        '{index} of {total}': t('lightbox.position'),
        'Show captions': t('lightbox.showCaptions'),
        'Hide captions': t('lightbox.hideCaptions'),
        'Zoom in': t('lightbox.zoomIn'),
        'Zoom out': t('lightbox.zoomOut'),
        'Enter Fullscreen': t('lightbox.enterFullscreen'),
        'Exit Fullscreen': t('lightbox.exitFullscreen')
      }}
      carousel={{ finite: isSingleSlide }}
      render={isSingleSlide ? { buttonPrev: () => null, buttonNext: () => null } : undefined}
    />
  )
}

export default ImageLightbox
