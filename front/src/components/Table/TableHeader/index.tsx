import React from 'react';
import styles from './TableHeader.module.css';

interface TableHeaderProps {
    children: React.ReactNode;
    isSticky?: boolean;
}

export const TableHeader: React.FC<TableHeaderProps> = ({ children, isSticky = false }) => {
  console.log('isSticky', isSticky);
  return <thead className={isSticky ? styles.stickyHeader : styles.tableHead}>{children}</thead>;
};
