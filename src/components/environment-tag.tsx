/* eslint-disable i18next/no-literal-string */
const DEV_HOST = 'taskcoper-client.bentran1vn.com'

export default function EnvironmentTag() {
  if (typeof window === 'undefined') {
    return null
  }

  if (window.location.hostname !== DEV_HOST && !import.meta.env.DEV) {
    return null
  }

  return (
    <div className='rounded-sm px-1.5 py-0.5 bg-orange-50 border border-orange-400 border-dashed flex items-center gap-1.5'>
      <div className='size-1.5 rounded-full bg-orange-500 animate-pulse animation-duration-[2.2s] [animation-timing-function:ease-in-out]' />
      <p className='text-xs font-semibold text-orange-600'>Development</p>
    </div>
  )
}
