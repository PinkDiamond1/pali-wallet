import React, { FC } from 'react';
import clsx from 'clsx';
// import { useAlert } from 'react-alert';

import styles from './index.scss';

const AboutView: FC = () => {
  // const alert = useAlert();
  // const handleSupportClick = () => {
  //   alert.removeAll();
  //   alert.error('We are currently building the support channels.');
  // };
  // const handleDocsClick = () => {
  //   alert.removeAll();
  //   alert.error('We are currently building the API docs.');
  // };
  return (
    <div className={styles.about}>
      <span>Pali Wallet Chrome Extension v1.0</span>
      <span>Version: 1.0.4</span>
      <span>
        Support:{'Is handled at syscoin discord on pali_support channel'}
        <a
          className={styles.link}
          href="https://discord.gg/pZ5fMdJpCu"
          // target="_blank"
          // onClick={handleSupportClick}
        >
          pali support
        </a>
      </span>
      <span>
        API Docs
        <a
          className={clsx(styles.link, styles.terms)}
          href="https://pali-docs.vercel.app/"
          // target="_blank"
          // onClick={handleDocsClick}
        >
          pali API
        </a>
      </span>
    </div>
  );
};

export default AboutView;
