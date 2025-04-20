import { useAlerts } from '../../../context/AlertContext';
import { TableBody, TableCell, Table, TableRow } from '../../Table';
import styles from './AlertTable.module.css';
import { useCallback, useEffect, useRef } from 'react';
import AlertTableHeader from './AlertTableHeader';

const AlertTable = () => {
  const { alerts, loading, error, hasMore, fetchMoreAlerts } = useAlerts();
  const observerRef = useRef();
  const loadingRef = useRef(null);

  const lastAlertRef = useCallback(node => {
    if (loading) return;

    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        fetchMoreAlerts();
      }
    });

    if (node) {
      observerRef.current.observe(node);
    }
  }, [loading, hasMore, fetchMoreAlerts]);

  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  const getStatusDisplay = (status) => {
    if (status === 'triggered') {
      return <span className={styles.statusTriggered}>Triggered</span>;
    }
    return <span className={styles.statusNotTriggered}>Not Triggered</span>;
  };
  const formatLocation = (location) => {
    const decimalDegreeRegex = /^-?\d+(\.\d+)?,\s*-?\d+(\.\d+)?$/;
    if (decimalDegreeRegex.test(location)) {
      const [lat, lon] = location.split(',').map(Number);
      return `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
    }
    return location;
  };
  if (loading && !alerts) return <div className={styles.loading}>Loading...</div>;
  if (error) return <div className={styles.error}>Error: {error}</div>;
  return (
    <div className={styles.container}>
      <h2 className={styles.header}>Alert List</h2>
      <div className={styles.tableWrapper}>
        <Table>
          <AlertTableHeader />
          <TableBody>
            {alerts.map((alert, index) => (
              <TableRow 
                key={alert._id} 
                ref={index === alerts.length - 7 ? lastAlertRef : undefined}
              >
                <TableCell type="name">{alert.name || 'Unnamed Alert'}</TableCell>
                <TableCell type="location">{formatLocation(alert.location)}</TableCell>
                <TableCell type="parameter">{alert.parameter}</TableCell>
                <TableCell type="operator">{alert.threshold.operator.toUpperCase()}</TableCell>
                <TableCell type="value">{alert.threshold.value}</TableCell>
                <TableCell type="status">{getStatusDisplay(alert.status)}</TableCell>
                <TableCell type="timestamp">{new Date(alert.createdAt).toLocaleString()}</TableCell>
                <TableCell type="timestamp">{new Date(alert.updatedAt).toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
          {loading && <div className={styles.loadingMore}>Loading more...</div>}
      </div>
    </div>
  );
};

AlertTable.propTypes = {
  // Add any props validation if needed
};

export default AlertTable;
