import { useCallback, useEffect, useRef, useState } from 'react';

type Status = 'idle' | 'loading' | 'ready' | 'error';

export function useWebcam(videoRef: React.RefObject<HTMLVideoElement>) {
  const streamRef = useRef<MediaStream | null>(null);

  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);

  const start = useCallback(async () => {
    try {
      setError(null);
      setStatus('loading');

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false,
      });

      streamRef.current = stream;

      const video = videoRef.current;
      if (!video) throw new Error('videoRef가 연결되지 않았습니다.');

      video.srcObject = stream;
      await video.play();

      setStatus('ready');
    } catch (e) {
      const message = e instanceof Error ? e.message : '카메라 접근에 실패했습니다.';
      setError(message);
      setStatus('error');
    }
  }, [videoRef]);

  const stop = useCallback(() => {
    const stream = streamRef.current;
    if (stream) {
      stream.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }

    const video = videoRef.current;
    if (video) {
      video.pause();
      video.srcObject = null;
    }

    setStatus('idle');
  }, [videoRef]);

  useEffect(() => {
    return () => stop();
  }, [stop]);

  return { status, error, start, stop };
}
