import { ButtonHTMLAttributes } from 'react';
import classNames from 'classnames/bind';
import styles from './Button.module.scss';

const cx = classNames.bind(styles);

type Variant = 'primary' | 'ghost' | 'danger';
type Size = 'sm' | 'md';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

export default function Button({
  variant = 'ghost',
  size = 'md',
  className,
  ...rest
}: Props) {
  return (
    <button
      type="button"
      className={cx('btn', variant, size, className)}
      {...rest}
    />
  );
}
