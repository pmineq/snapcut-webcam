import { useCallback, useMemo, useRef } from "react";
import classNames from "classnames/bind";
import styles from "./WebcamView.module.scss";

import { useWebcam } from "@/hooks/useWebcam";
import { captureToPngDataUrl } from "@/utils/canvas";
import Button from "@/components/common/Button/Button";

import { FRAMES, type FrameKey } from "@/utils/frames";
import type { FilterKey } from "@/utils/filters";

const cx = classNames.bind(styles);

type Props = {
  onSnap: (pngDataUrl: string) => void;
  filter: FilterKey;
  frame: FrameKey;
  disabled?: boolean;
};

export default function WebcamView({ onSnap, filter, frame, disabled }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const { status, error, start, stop } = useWebcam(videoRef);

  const frameOverlaySrc = useMemo(
    () => FRAMES[frame]?.src ?? null,
    [frame]
  );


  const handleSnap = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;

    // 프레임 이미지 로드 (선택된 경우)
    let frameImg: HTMLImageElement | null = null;
    if (frameOverlaySrc) {
      frameImg = await loadImage(frameOverlaySrc);
    }

    const png = captureToPngDataUrl(video, {
      width: 540,
      height: 432,
      filter,
      frameImage: frameImg,
    });

    onSnap(png);
  }, [onSnap, filter, frameOverlaySrc]);

  return (
    <div className={cx("wrap")}>
      <div className={cx("videoBox")}>
        
        <video ref={videoRef} className={cx("video", filter)} playsInline muted />

        {frameOverlaySrc && <img className={cx("frameOverlay")} src={frameOverlaySrc} alt="" />}

        {status !== "ready" && (
          <div className={cx("overlay")}>
            {status === "idle" && <span>카메라 시작 전</span>}
            {status === "loading" && <span>카메라 연결 중…</span>}
            {status === "error" && <span>{error ?? "카메라 오류"}</span>}
          </div>
        )}
      </div>

      <div className={cx("actions")}>
        <Button size="md" variant="primary" onClick={start} disabled={status === "loading" || status === "ready"}>
          Start
        </Button>
        <Button size="md" variant="ghost" onClick={stop} disabled={status !== "ready"}>
          Stop
        </Button>
        <Button size="md" variant="primary" onClick={handleSnap} disabled={status !== 'ready' || disabled}>
          SNAP
        </Button>
      </div>
    </div>
  );
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
