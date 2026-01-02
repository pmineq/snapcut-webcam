import classNames from "classnames/bind";
import styles from "./Controls.module.scss";
import Button from "@/components/common/Button/Button";
import { FILTERS, type FilterKey } from "@/utils/filters";

const cx = classNames.bind(styles);

type FrameKey = "none" | "bunny" | "film" | "heart";

type Props = {
  filter: FilterKey;
  onChangeFilter: (k: FilterKey) => void;

  frame: FrameKey;
  onChangeFrame: (k: FrameKey) => void;

  frames: { key: FrameKey; label: string; thumbSrc: string }[];
};

export default function Controls({
  filter,
  onChangeFilter,
  frame,
  onChangeFrame,
  frames = [],
}: Props) {
  return (
    <div className={cx("wrap")}>
      <section className={cx("section")}>
        <h3 className={cx("title")}>필터</h3>
        <div className={cx("row")}>
          {(Object.keys(FILTERS) as FilterKey[]).map((k) => (
            <Button
              key={k}
              size="sm"
              variant={k === filter ? "primary" : "ghost"}
              onClick={() => onChangeFilter(k)}
            >
              {FILTERS[k].label}
            </Button>
          ))}
        </div>
      </section>

      <section className={cx("section")}>
        <h3 className={cx("title")}>프레임</h3>
        <div className={cx("grid")}>
          {frames.map((f) => (
            <button
              key={f.key}
              type="button"
              className={cx("frameBtn", f.key === frame && "active")}
              onClick={() => onChangeFrame(f.key)}
            >
              {f.thumbSrc && (
                <img
                  className={cx("thumb")}
                  src={f.thumbSrc}
                  alt={f.label}
                />
              )}
              <span className={cx("label")}>{f.label}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
