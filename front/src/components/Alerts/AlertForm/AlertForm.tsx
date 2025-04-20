import React, { memo, useState } from 'react';
import { useAlerts } from '../../../context/AlertContext';
import styles from './AlertForm.module.css';
import { Alert } from '../../../services/alertsAPIV1';
import { Select } from '../../Select/Select';
import { Input } from '../../Input/Input';
import { Textarea } from '../../Textarea/Textarea';

const PARAMETERS = ['temperature', 'humidity', 'windSpeed'];
const OPERATORS = [
  { value: 'gt', label: 'Greater than (>)' },
  { value: 'lt', label: 'Less than (<)' },
  { value: 'eq', label: 'Equal to (=)' },
  { value: 'gte', label: 'Greater than or equal to (>=)' },
  { value: 'lte', label: 'Less than or equal to (<=)' }
];
interface AlertFormProps {
  addAlert: (alert: Omit<Alert, '_id' | 'createdAt' | 'updatedAt' | 'status' | 'userId'>) => Promise<void>;
}
const AlertFormModel:React.FC = () =>{
  const { addAlert } = useAlerts();
  return <AlertForm addAlert={addAlert} />
}
const AlertForm:React.FC<AlertFormProps> = memo(({addAlert}) => {
  const [error, setError] = useState<string | null> (null);
  const [formData, setFormData] = useState<Omit<Alert, '_id' | 'createdAt' | 'updatedAt' | 'status' | 'userId'>>({
    location:  '',
    parameter: 'temperature',
    threshold: {
      operator:  'gt',
      value:  ''
    },
    name: '',
    description: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('threshold.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        threshold: {
          ...prev.threshold,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    debugger;
    try {
      // Convert numeric strings to numbers
      const processedData = {
        ...formData,
        location: formData.location,
        threshold: {
          ...formData.threshold,
          value: formData.threshold.value
        }
      };
      
      await addAlert(processedData);
      
      // Reset form after successful submission
      setFormData({
        location: '',
        parameter: 'temperature',
        threshold: {
          operator: 'gt',
          value: ''
        },
        name: '',
        description: ''
      });
    } catch (err: any) {
      setError(err.message);
    }
  };
  return (
    <form onSubmit={handleSubmit} className={styles.alertForm}>
      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.formGroup}>
        <label htmlFor="location">Location:</label> 
       
 
        <Input
          type="text"
          id="location"
          name="location"
          placeholder='(latitude,longitude), 10001 US, SW1, new york, etc.'
          value={formData.location}
          onChange={handleChange}
          required
        />
        </div>

      <div className={styles.formGroup}>
        <label htmlFor="parameter">Parameter:</label>
        <Select
          id="parameter"
          name="parameter"
          value={formData.parameter}
          onChange={handleChange}
          required
        >
          {PARAMETERS.map(param => (
            <option key={param} value={param}>
              {param.charAt(0).toUpperCase() + param.slice(1)}
            </option>
          ))}
        </Select>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="threshold.operator">Condition:</label>
        <Select
          id="threshold.operator"
          name="threshold.operator"
          value={formData.threshold.operator}
          onChange={handleChange}
          required
        >
          {OPERATORS.map(op => (
            <option key={op.value} value={op.value}>
              {op.label}
            </option>
          ))}
        </Select>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="threshold.value">Threshold Value:</label>
        <Input
          type="string"
          id="threshold.value"
          name="threshold.value"
          value={formData.threshold.value}
          onChange={handleChange}
          step="any"
          required
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="name">Name (Optional):</label>
        <Input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Give your alert a name"
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="description">Description (Optional):</label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Add a description for your alert"
          rows={3}
        />
      </div>

      <button type="submit" className={styles.submitButton}>
        Create Alert
      </button>
    </form>
  );
});
AlertForm.displayName = 'AlertForm';
export default AlertFormModel;