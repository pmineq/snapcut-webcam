import classNames from "classnames/bind";
import styles from "./Range.module.scss";

const cx = classNames.bind(styles);

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  valueLabel?: string;
};

export default function Range({ label, valueLabel, className, ...props }: Props) {
  return (
    <label className={cx("wrap", className)}>
      <div className={cx("top")}>
        <span className={cx("label")}>{label}</span>
        {valueLabel ? <span className={cx("value")}>{valueLabel}</span> : null}
      </div>
      <input className={cx("range")} type="range" {...props} />
    </label>
  );
}
