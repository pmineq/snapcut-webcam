import { useCallback, useMemo, useRef, useEffect } from "react";
import classNames from "classnames/bind";
import styles from "./WebcamView.module.scss";

import { useWebcam } from "@/hooks/useWebcam";
import { captureToPngDataUrl } from "@/utils/canvas";
import { loadImage } from "@/utils/loadImage";
import Button from "@/components/common/Button/Button";

import { FRAMES, type FrameKey } from "@/utils/frames";
import type { FilterKey } from "@/utils/filters";
import { SNPCUT_EVENTS } from "@/types/events";

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
    try {
      const video = videoRef.current;
      if (!video) return;

      // 프레임 이미지 로드 (선택된 경우)
      let frameImg: HTMLImageElement | null = null;
      if (frameOverlaySrc) {
        frameImg = await loadImage(frameOverlaySrc);
      }

      const rect = boxRef.current?.getBoundingClientRect();
      const size = rect ? Math.round(rect.width) : 720;

      const png = captureToPngDataUrl(video, {
        width: size,
        height: size,
        filter,
        frameImage: frameImg,
      });

      onSnap(png);
    } catch (error) {
      console.error("Failed to capture image:", error);
      alert("사진 촬영에 실패했습니다. 다시 시도해주세요.");
    }
  }, [onSnap, filter, frameOverlaySrc]);

  const boxRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onSnap = () => {
      if (status !== "ready" || disabled) return;
      handleSnap();
    };

    window.addEventListener(SNPCUT_EVENTS.SNAP, onSnap);
    return () => window.removeEventListener(SNPCUT_EVENTS.SNAP, onSnap);
  }, [handleSnap, status, disabled]);

  useEffect(() => {
    const onStart = () => start();
    window.addEventListener(SNPCUT_EVENTS.START_CAMERA, onStart);
    return () => window.removeEventListener(SNPCUT_EVENTS.START_CAMERA, onStart);
  }, [start]);

  useEffect(() => {
    const onRestart = async () => {
      if (status === "ready") {
        stop();
      }

      setTimeout(() => {
        start();
      }, 150);
    };

    window.addEventListener(SNPCUT_EVENTS.RESTART_CAMERA, onRestart);
    return () => window.removeEventListener(SNPCUT_EVENTS.RESTART_CAMERA, onRestart);
  }, [start, stop, status]);


  return (
    <div className={cx("wrap")}>
      <div ref={boxRef} className={cx("videoBox")}>
        
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
        <Button
          size="md"
          variant="primary"
          onClick={handleSnap}
          disabled={status !== "ready" || disabled}
          className={cx("snapBtn")}>
          SNAP
          </Button>

      </div>
    </div>
  );
}
