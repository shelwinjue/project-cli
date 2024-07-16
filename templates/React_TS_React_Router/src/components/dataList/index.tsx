import React from 'react';
import { Watermark } from 'antd';
import * as styles from './index.module.scss';
interface IProps {
  list: string[];
}

export default function DataList(props: IProps) {
  const { list } = props;

  return (
    <Watermark content="Ant Design">
      <div className={styles.wrap}>
        {list?.map((item, index) => (
          <div className={styles.item} key={index}>
            {item}
          </div>
        ))}
      </div>
    </Watermark>
  );
}
