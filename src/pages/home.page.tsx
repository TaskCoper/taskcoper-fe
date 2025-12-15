export default function HomePage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 1.5rem',
        backgroundColor: '#ffffff',
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, -system-ui, 'Segoe UI', sans-serif"
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '840px',
          textAlign: 'center'
        }}
      >
        <h1
          style={{
            fontSize: 'clamp(2.4rem, 3.4vw, 3.1rem)',
            fontWeight: 800,
            marginBottom: '1rem',
            color: '#111827',
            letterSpacing: '-0.03em'
          }}
        >
          Comming Soon
        </h1>

        <p
          style={{
            fontSize: '0.95rem',
            lineHeight: 1.6,
            margin: '0 auto 0.5rem',
            color: '#4b5563'
          }}
        >
          Taskcoper nền tảng quản trị toàn diện dành cho doanh nghiêp vừa và nhỏ (SME) - giải pháp số về quản trị cho
          doanh nghiệp giáo dục triển khai mô hình Project Based Learning.
        </p>

        <p
          style={{
            fontSize: '0.9rem',
            fontWeight: 600,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: '#111827',
            marginTop: '0.5rem'
          }}
        >
          Quản Trị · Kết Nối · Bức Tốc
        </p>
      </div>
    </div>
  )
}
