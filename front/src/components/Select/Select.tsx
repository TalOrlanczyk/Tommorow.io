import React from 'react';
import styles from './Select.module.css';

interface SelectProps {
    children: React.ReactNode;
    id?: string;
    name?: string;
    required?: boolean;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    value: string;
    disabled?: boolean;
}

export const Select = ({ children, onChange, value, id, name, required, disabled }: SelectProps) => {
    return (
        <select className={styles.select} onChange={onChange} value={value} id={id} name={name} required={required} disabled={disabled}>
            {children}
        </select>
    )
}
