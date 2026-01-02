import { useCallback, useMemo, useState } from "react";
import classNames from "classnames/bind";
import styles from "./Home.module.scss";

import WebcamView from "@/components/WebcamView/WebcamView";
import Controls from "@/components/Controls/Controls";
import ShotGrid from "@/components/ShotGrid/ShotGrid";
import { downloadDataUrlAsFile } from "@/utils/download";

import { FRAMES, type FrameKey } from "@/utils/frames";
import { type FilterKey } from "@/utils/filters";
import { makeGridImageDataUrl } from '@/utils/makeGridImage';

import { Button } from "../../components/common";

const cx = classNames.bind(styles);

export type Shot = {
  id: string;
  dataUrl: string;
  createdAt: number;
};

export default function Home() {
  const [shots, setShots] = useState<Shot[]>([]);
  const [filter, setFilter] = useState<FilterKey>("none");
  const [frame, setFrame] = useState<FrameKey>("none");

  const frames = useMemo(
    () =>
      Object.entries(FRAMES).map(([key, v]) => ({
        key: key as FrameKey,
        label: v.label,
        thumbSrc: v.thumbSrc ?? "",
      })),
    []
  );

  const handleDownloadGrid = useCallback(async () => {
  if (shots.length === 0) return;

  const png = await makeGridImageDataUrl(
    shots.map(s => s.dataUrl),
    {
      cols: 3,
      cellWidth: 540,
      cellHeight: 432,
      gap: 16,
      background: '#111',
    }
  );

  downloadDataUrlAsFile(png, `snpcut-grid-${Date.now()}.png`);
}, [shots]);

const MAX_SHOTS = 9;

const handleSnap = useCallback((pngDataUrl: string) => {
  setShots(prev => {
    if (prev.length >= MAX_SHOTS) return prev;

    return [
      { id: crypto.randomUUID(), dataUrl: pngDataUrl, createdAt: Date.now() },
      ...prev,
    ];
  });
}, []);

  const handleRemove = useCallback((id: string) => {
    setShots((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const handleClear = useCallback(() => setShots([]), []);

  const latestShot = useMemo(() => shots[0], [shots]);

  const handleDownloadLatest = useCallback(() => {
    if (!latestShot) return;
    downloadDataUrlAsFile(latestShot.dataUrl, `snpcut-${latestShot.createdAt}.png`);
  }, [latestShot]);

  return (
    <div className={cx("page")}>
      <header className={cx("header")}>
        <h1 className={cx("title")}>SNPCUT</h1>
        <p className={cx("desc")}>SNAP → ShotGrid 누적 → PNG 다운로드</p>
      </header>

      <main className={cx("content")}>
        <section className={cx("left")}>
          <WebcamView
            onSnap={handleSnap}
            filter={filter}
            frame={frame}
            disabled={shots.length >= MAX_SHOTS}
          />

          <Controls
            filter={filter}
            onChangeFilter={setFilter}
            frame={frame}
            onChangeFrame={setFrame}
            frames={frames}
          />

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


        </section>

        <section className={cx("right")}>
          <ShotGrid shots={shots} onRemove={handleRemove} />
        </section>
      </main>
    </div>
  );
}
