import { useEffect, useRef, useState, useCallback } from 'react'
import { Box, Stack, Text } from '@chakra-ui/react'
import { Html5Qrcode } from 'html5-qrcode'

const SCANNER_ID = 'smooy-qr-reader'

export default function QrScanner({ onScanSuccess, onScanError }) {
  const [error, setError] = useState(null)
  const [started, setStarted] = useState(false)
  const [size, setSize] = useState(0)
  const scannerRef = useRef(null)
  const mountedRef = useRef(true)
  const wrapperRef = useRef(null)

  const startScanner = useCallback(async () => {
    const el = document.getElementById(SCANNER_ID)
    if (!el || !size) return

    const qrbox = Math.floor(size * 0.82)

    try {
      const scanner = new Html5Qrcode(SCANNER_ID)
      scannerRef.current = scanner

      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: qrbox, height: qrbox } },
        (decodedText) => {
          if (mountedRef.current) onScanSuccess?.(decodedText)
        },
        () => {}
      )

      if (mountedRef.current) setStarted(true)
    } catch (err) {
      if (!mountedRef.current) return
      const msg = String(err?.message || err || '')

      if (msg.includes('NotAllowedError') || msg.includes('Permission')) {
        setError('Camera permission was denied. Please allow camera access in your browser settings and reload the page.')
      } else if (msg.includes('NotFoundError') || msg.includes('Requested device not found')) {
        setError('No camera found on this device.')
      } else if (msg.includes('NotReadableError')) {
        setError('Camera is already in use by another app. Close other apps and reload.')
      } else if (msg.includes('insecure') || msg.includes('secure context')) {
        setError('Camera requires a secure (HTTPS) connection. Please use HTTPS.')
      } else {
        setError('Camera access denied or unavailable. Please allow camera permissions and reload.')
      }
      onScanError?.(err)
    }
  }, [onScanSuccess, onScanError, size])

  useEffect(() => {
    if (wrapperRef.current) {
      setSize(wrapperRef.current.offsetWidth)
    }
  }, [])

  useEffect(() => {
    if (!size) return
    mountedRef.current = true

    const timer = setTimeout(() => {
      if (mountedRef.current) startScanner()
    }, 500)

    return () => {
      mountedRef.current = false
      clearTimeout(timer)
      const scanner = scannerRef.current
      if (scanner) {
        scanner.stop().then(() => {
          try { scanner.clear() } catch (_) { /* noop */ }
        }).catch(() => {
          try { scanner.clear() } catch (_) { /* noop */ }
        })
        scannerRef.current = null
      }
    }
  }, [size, startScanner])

  return (
    <Stack align="center" gap={4} width="100%">
      <Box
        ref={wrapperRef}
        width="100%"
        position="relative"
        borderRadius="28px"
        overflow="hidden"
        border="3px solid rgba(255,255,255,0.45)"
        bg={started ? 'black' : 'rgba(0,0,0,0.05)'}
        style={size ? { height: `${size}px` } : { aspectRatio: '1' }}
      >
        <Box
          id={SCANNER_ID}
          position="absolute"
          top="50%"
          left="0"
          width="100%"
          style={{ transform: 'translateY(-50%)' }}
          sx={{
            '& video': {
              objectFit: 'cover !important',
              width: '100% !important',
              height: `${size}px !important`,
            },
          }}
        />
      </Box>
      {error && (
        <Text fontSize="clamp(12px, 3.5vw, 15px)" color="red.400" textAlign="center" px={4}>
          {error}
        </Text>
      )}
    </Stack>
  )
}
