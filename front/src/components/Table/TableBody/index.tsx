import React from 'react';
import styles from './TableBody.module.css';

interface TableBodyProps {
    children: React.ReactNode;
}

export const TableBody: React.FC<TableBodyProps> = ({ children }) => {
  return <tbody className={styles.tableBody}>{children}</tbody>;
};
