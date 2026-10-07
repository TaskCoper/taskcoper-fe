import { cn } from '@/shared/utils'
import MarketingPostGalleryImage from './marketing-post-gallery-image'

// Masonry bằng CSS columns để ảnh giữ đúng tỉ lệ gốc thay vì bị crop vuông.
// Một ảnh thì trải hết bề ngang, nhiều ảnh mới chia 2 cột.
const MarketingPostImageGrid = ({
  images,
  onOpenImage,
  getOpenLabel
}: {
  images: { src: string; alt: string }[]
  onOpenImage: (index: number) => void
  getOpenLabel: (index: number) => string
}) => {
  return (
    <div className={cn('gap-3', images.length > 1 ? 'columns-2' : 'block')}>
      {images.map((image, index) => (
        <MarketingPostGalleryImage
          key={`${image.src}-${index}`}
          src={image.src}
          alt={image.alt}
          openLabel={getOpenLabel(index)}
          onOpen={() => onOpenImage(index)}
          className='mb-3 break-inside-avoid last:mb-0'
        />
      ))}
    </div>
  )
}

export default MarketingPostImageGrid
