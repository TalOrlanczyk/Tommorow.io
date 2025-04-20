import React, { forwardRef } from 'react';
import styles from './TableRow.module.css';

interface TableRowProps {
    children: React.ReactNode;
}
export const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(({ children }, ref) => {
  return <tr className={styles.tableRow} ref={ref}>{children}</tr>;
});
