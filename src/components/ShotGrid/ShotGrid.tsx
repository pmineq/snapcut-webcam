import classNames from 'classnames/bind';
import styles from './ShotGrid.module.scss';
import type { Shot } from '@/pages/Home/Home';
import Button from '@/components/common/Button/Button';
import { downloadDataUrlAsFile } from '@/utils/download';

const cx = classNames.bind(styles);

type Props = {
  shots: Shot[];
  onRemove: (id: string) => void;
};

const ShotGrid = ({ shots, onRemove }: Props) => {
  const handleDownload = (shot: Shot) => {
    downloadDataUrlAsFile(
      shot.dataUrl,
      `snpcut-${shot.createdAt}.png`
    );
  };

  return (
    <div className={cx('wrap')}>
      <div className={cx('head')}>
        <h2 className={cx('title')}>ShotGrid</h2>
        <span className={cx('count')}>{shots.length}</span>
      </div>

      {shots.length === 0 ? (
        <div className={cx('empty')}>아직 샷이 없어요. SNAP 해보세요!</div>
      ) : (
        <ul className={cx('grid')}>
          {shots.map(shot => (
            <li key={shot.id} className={cx('item')}>
              <img className={cx('img')} src={shot.dataUrl} alt="shot" />

              <div className={cx('meta')}>
                <span className={cx('time')}>
                  {new Date(shot.createdAt).toLocaleTimeString()}
                </span>

                <div className={cx('actions')}>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDownload(shot)}
                  >
                    다운
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onRemove(shot.id)}
                  >
                    삭제
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ShotGrid;
