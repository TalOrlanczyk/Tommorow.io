import React from 'react';
import classNames from 'classnames';
import styles from './TableCell.module.css';

export type CellType = 
  | 'default'
  | 'name'
  | 'location'
  | 'parameter'
  | 'operator'
  | 'value'
  | 'status'
  | 'timestamp'
  | 'header';

interface TableCellProps {
  type?: CellType;
  children: React.ReactNode;
  className?: string;
}

export const TableCell: React.FC<TableCellProps> = ({ 
  type = 'default',
  children,
  className
}) => {
  const cellClassName = classNames(
    styles.cell,
    {
      [styles.cellDefault]: type === 'default',
      [styles.cellName]: type === 'name',
      [styles.cellLocation]: type === 'location',
      [styles.cellParameter]: type === 'parameter',
      [styles.cellOperator]: type === 'operator',
      [styles.cellValue]: type === 'value',
      [styles.cellStatus]: type === 'status',
      [styles.cellTimestamp]: type === 'timestamp',
      [styles.headerCell]: type === 'header'
    },
    className
  );

  return <td className={cellClassName}>{children}</td>;
};

export default TableCell;
