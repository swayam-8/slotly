import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          padding: '72px',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#f8fafc',
          color: '#111827',
          fontFamily: 'sans-serif'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          <div
            style={{
              display: 'flex',
              width: '64px',
              height: '64px',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '18px',
              background: '#4f46e5',
              color: 'white',
              fontSize: '38px',
              fontWeight: 700
            }}
          >
            S
          </div>
          <span style={{ fontSize: '32px', fontWeight: 700 }}>Slotly</span>
        </div>
        <div
          style={{
            display: 'flex',
            maxWidth: '900px',
            flexDirection: 'column'
          }}
        >
          <span style={{ color: '#4f46e5', fontSize: '24px', fontWeight: 600 }}>
            Booking, made simple
          </span>
          <span
            style={{
              marginTop: '18px',
              fontSize: '68px',
              fontWeight: 700,
              lineHeight: 1.08
            }}
          >
            More time for what you do best.
          </span>
          <span
            style={{ marginTop: '22px', color: '#475569', fontSize: '27px' }}
          >
            Scheduling for salons, clinics, tutors, and independent
            professionals.
          </span>
        </div>
        <div style={{ color: '#64748b', fontSize: '20px' }}>slotly.app</div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
