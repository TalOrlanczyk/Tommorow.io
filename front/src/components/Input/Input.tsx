import React from 'react';
import styles from './Input.module.css';

interface InputProps {
    id?: string;
    name?: string;
    required?: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    value?: string | number;
    type?: string;
    step?: string;
    placeholder?: string;
    checked?: boolean;
    min?: string;
    max?: string;
}

export const Input = ({ onChange, value, id, name, required, type, step, placeholder, checked, min, max }: InputProps) => {
    return (
        <input className={styles.input} onChange={onChange} value={value} id={id} name={name} required={required} 
                type={type} step={step} placeholder={placeholder} checked={checked} min={min} max={max} />
    )
}
