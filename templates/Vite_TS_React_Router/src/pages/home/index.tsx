import styles from './index.module.scss';
import DatasetSVG from '@/assets/dataset.svg?react';
export default function Home() {
  return (
    <div className={styles.home}>
      <DatasetSVG width={40} height={40} /> 主页
    </div>
  );
}
