'use client'

import { Suspense } from 'react'
import { useUTMTracking } from '@/hooks/useUTMTracking'

function UTMCapture() {
  useUTMTracking()
  return null
}

export default function AttributionCapture() {
  return (
    <Suspense>
      <UTMCapture />
    </Suspense>
  )
}
