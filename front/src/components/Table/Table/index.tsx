import React from 'react';
import styles from './Table.module.css';

interface TableProps {
    children: React.ReactNode;
}

export const Table: React.FC<TableProps> = ({ children }) => {
  return <table className={styles.table}>{children}</table>;
};
