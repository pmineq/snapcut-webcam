import { useCallback, useMemo, useState } from "react";
import classNames from "classnames/bind";
import styles from "./Home.module.scss";

import WebcamView from "@/components/WebcamView/WebcamView";
import Controls from "@/components/Controls/Controls";
import ShotGrid from "@/components/ShotGrid/ShotGrid";
import { downloadDataUrlAsFile } from "@/utils/download";
import { useLocalStorage } from "@/hooks/useLocalStorage";

import { FRAMES, type FrameKey } from "@/utils/frames";
import { type FilterKey } from "@/utils/filters";
import { makeGridImageDataUrl } from '@/utils/makeGridImage';
import { SNPCUT_EVENTS } from "@/types/events";

import { Button } from "../../components/common";

const cx = classNames.bind(styles);

const MAX_SHOTS = 9;

export type Shot = {
  id: string;
  dataUrl: string;
  createdAt: number;
};

export default function Home() {
  const [shots, setShots] = useState<Shot[]>([]);
  const [filter, setFilter] = useState<FilterKey>("none");
  const [frame, setFrame] = useState<FrameKey>("none");
  const [autoSave, setAutoSave] = useLocalStorage('snpcut-auto-save', false);

  const frames = useMemo(
    () =>
      Object.entries(FRAMES).map(([key, v]) => ({
        key: key as FrameKey,
        label: v.label,
        thumbSrc: v.thumbSrc,
      })),
    []
  );

  const handleDownloadGrid = useCallback(async () => {
    if (shots.length === 0) return;

    try {
      const png = await makeGridImageDataUrl(
        shots.map(s => s.dataUrl),
        {
          cols: 3,
          cellWidth: 540,
          cellHeight: 540,
          gap: 16,
          background: '#111',
        }
      );

      downloadDataUrlAsFile(png, `snpcut-grid-${Date.now()}.png`);
    } catch (error) {
      console.error("Failed to create grid image:", error);
      alert("그리드 이미지 생성에 실패했습니다. 다시 시도해주세요.");
    }
  }, [shots]);

  const handleSnap = useCallback((pngDataUrl: string) => {
    const timestamp = Date.now();
    const newShot = { id: crypto.randomUUID(), dataUrl: pngDataUrl, createdAt: timestamp };

    setShots(prev => {
      if (prev.length >= MAX_SHOTS) return prev;

      return [newShot, ...prev];
    });

    // 자동 저장이 활성화된 경우 즉시 다운로드
    if (autoSave) {
      downloadDataUrlAsFile(pngDataUrl, `snpcut-${timestamp}.png`);
    }
  }, [autoSave]);

  const handleRemove = useCallback((id: string) => {
    setShots((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const handleClear = useCallback(() => setShots([]), []);

  const latestShot = useMemo(() => shots[0], [shots]);

  const recentShots = useMemo(() => shots.slice(0, 3), [shots]);

  const handleDownloadLatest = useCallback(() => {
    if (!latestShot) return;
    downloadDataUrlAsFile(latestShot.dataUrl, `snpcut-${latestShot.createdAt}.png`);
  }, [latestShot]);

  const [showCameraGate, setShowCameraGate] = useState(true);

  const handleStartCamera = useCallback(() => {
    setShowCameraGate(false);
    window.dispatchEvent(new CustomEvent(SNPCUT_EVENTS.START_CAMERA));
  }, []);

  const [isGalleryOpen, setIsGalleryOpen] = useState(false);


  return (
    <div className={cx("page")}>
      <header className={cx("header")}>
        <h1 className={cx("title")}>SNPCUT</h1>
        <p className={cx("desc")}>SNAP → ShotGrid 누적 → PNG 다운로드</p>

        <div className={cx("headerActions")}>
          <label className={cx("autoSaveToggle")}>
            <input
              type="checkbox"
              checked={autoSave}
              onChange={(e) => setAutoSave(e.target.checked)}
              className={cx("checkbox")}
            />
            <span className={cx("label")}>자동 저장</span>
          </label>

          <button
            type="button"
            className={cx("restartBtn")}
            onClick={() => {
              window.dispatchEvent(new CustomEvent(SNPCUT_EVENTS.RESTART_CAMERA));
            }}
            aria-label="카메라 재시작"
          >
            ⟳
          </button>
        </div>
      </header>

      <main className={cx("content")}>
        <section className={cx("left")}>
          <WebcamView
            onSnap={handleSnap}
            filter={filter}
            frame={frame}
            disabled={shots.length >= MAX_SHOTS}
          />

          <div className={cx("pc-control")}>
            <Controls
              filter={filter}
              onChangeFilter={setFilter}
              frame={frame}
              onChangeFrame={setFrame}
              frames={frames}
            />
          </div>

          <div className={cx('pc-actions')}>
            <div className={cx("actions")}>
              <Button size="md" variant="primary" onClick={handleDownloadLatest} disabled={!latestShot}>
                최신 PNG 다운로드
              </Button>
              <Button size="md" variant="danger" onClick={handleClear} disabled={shots.length === 0}>
                전체 삭제
              </Button>
            </div>

            <Button
              size="md"
              variant="primary"
              onClick={handleDownloadGrid}
              disabled={shots.length === 0}
            >
              Grid 다운로드
            </Button> 
          </div>


        </section>

        <section className={cx("right", 'pc-grid')}>
          <ShotGrid shots={shots} onRemove={handleRemove} />
        </section>

        <div className={cx("mobileDock")}>
          <div className={cx("dockInner")}>
            <Controls
              filter={filter}
              onChangeFilter={setFilter}
              frame={frame}
              onChangeFrame={setFrame}
              frames={frames}
            />
          </div>

        {/* 모바일 전용 SNAP 버튼 */}
        <button
          type="button"
          className={cx("mobileSnap")}
          onClick={() => {
            window.dispatchEvent(new CustomEvent(SNPCUT_EVENTS.SNAP));
          }}
          disabled={shots.length >= MAX_SHOTS}
          aria-label="촬영"
        >
          <span className="blind">촬영</span>
        </button>

        
        {/* 좌하단 최근사진 스택 */}
        <button
          type="button"
          className={cx("recentStackBtn", shots.length === 0 && "disabled")}
          onClick={() => shots.length > 0 && setIsGalleryOpen(true)}
          aria-label="최근 사진 열기"
        >
          <div className={cx("recentStack")}>
            {recentShots.map((s, idx) => (
              <img
                key={s.id}
                className={cx("recentThumb", `layer${idx}`)}
                src={s.dataUrl}
                alt="recent shot"
              />
            ))}

            {shots.length > 0 && (
              <div className={cx("recentBadge")}>{shots.length}</div>
            )}
          </div>
        </button>

        </div>


      </main>

  {/* 갤러리 모달 */}
  {isGalleryOpen && (
    <div className={cx("modal")} role="dialog" aria-modal="true" onClick={() => setIsGalleryOpen(false)}>
      <div className={cx("modalInner")} onClick={(e) => e.stopPropagation()}>
        <div className={cx("modalHead")}>
          <h3 className={cx("modalTitle")}>최근 사진</h3>
          <button type="button" className={cx("modalClose")} onClick={() => setIsGalleryOpen(false)}>
            닫기
          </button>
        </div>
        
        <div className={cx("modalHead")}>
          <Button
              size="md"
              variant="primary"
              onClick={handleDownloadGrid}
              disabled={shots.length === 0}
            >
              Grid 다운로드
            </Button>

            <Button size="md" variant="danger" onClick={handleClear} disabled={shots.length === 0}>
                전체 삭제
            </Button>
        </div>

        {shots.length === 0 ? (
          <div className={cx("modalEmpty")}>아직 샷이 없어요. SNAP 해보세요!</div>
        ) : (
          <ul className={cx("modalList")}>
            {shots.map((shot) => (
              <li key={shot.id} className={cx("modalItem")}>
                <img className={cx("modalImg")} src={shot.dataUrl} alt="shot" />

                <div className={cx("modalMeta")}>
                  <span className={cx("modalTime")}>
                    {new Date(shot.createdAt).toLocaleTimeString()}
                  </span>

                  <div className={cx("modalActions")}>
                    <button
                      type="button"
                      className={cx("modalBtn")}
                      onClick={() =>
                        downloadDataUrlAsFile(shot.dataUrl, `snpcut-${shot.createdAt}.png`)
                      }
                    >
                      다운로드
                    </button>
                    <button
                      type="button"
                      className={cx("modalBtn", "danger")}
                      onClick={() => handleRemove(shot.id)}
                    >
                      삭제
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )}


      {/* 카메라 허용 팝업 */}
      {showCameraGate && (
        <div className={cx("gate")} role="dialog" aria-modal="true">
          <div className={cx("gateCard")}>
            <h2 className={cx("gateTitle")}>카메라 사용 허용이 필요해요</h2>
            <p className={cx("gateDesc")}>
              ‘허용’을 누르면 바로 촬영을 시작할 수 있어요.
            </p>

            <div className={cx("gateActions")}>
              <button
                type="button"
                className={cx("gateBtnPrimary")}
                onClick={handleStartCamera}
              >
                카메라 시작
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
