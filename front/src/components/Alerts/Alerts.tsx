import AlertTable from "./AlertsTable/AlertTable";
import AlertFormModel from "./AlertForm/AlertForm";
import { AlertProvider } from "../../context/AlertContext";
import React from "react";
const Alerts: React.FC = () => {
  return (
    <AlertProvider>
      <div className="alerts-container">
        <h2>Weather Alerts</h2>
        <AlertFormModel />
        <AlertTable />
      </div>
    </AlertProvider>
  );
};

export default Alerts;
