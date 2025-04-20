import React from 'react';
import styles from './Textarea.module.css';

interface TextareaProps {
    id?: string;
    name?: string;
    required?: boolean;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    value?: string | number;
    placeholder?: string;
    rows?: number;
}

    export const Textarea = ({ onChange, value, id, name, required, rows, placeholder }: TextareaProps) => {
    return (
        <textarea className={styles.textarea} onChange={onChange} value={value} id={id} name={name} required={required} rows={rows} placeholder={placeholder}/>
    )
}
