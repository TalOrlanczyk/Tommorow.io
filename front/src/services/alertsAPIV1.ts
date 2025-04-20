import ApiClient from "../utils/apiClient";
type getAlerts = {
  data: Alert[],
  pagination: Pagination
}
export type Alert = {
  _id: string,
  name?: string;
  description?: string;
  location: string;
  parameter: string;
  threshold: Threshold;
  status: 'triggered' | 'notTriggered';
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

type Threshold = {
  operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
  value: string | number
}
type Pagination = {
  total: number,
  page: number,
  limit: number,
  totalPages: number
}
class AlertsAPIV1 {
  private apiClient: ApiClient;
  constructor(baseUrl = import.meta.env.VITE_ALERT_SERVER_URL) {
    this.apiClient = new ApiClient(`${baseUrl}/api/v1/alerts`);
  }

  async getAlerts(page = 1, limit = 10): Promise<getAlerts> {
    return this.apiClient.get('/',  {
        page,
        limit
      }, { 
      headers: {
        'x-user-id': localStorage.getItem('clientId')
      }
    });
  }

  async createAlert(alert: Omit<Alert, '_id' | 'createdAt' | 'updatedAt' | 'status' | 'userId'>) {
    return this.apiClient.post('/', alert,
      {
        headers: {
          'x-user-id': localStorage.getItem('clientId')
        }
      }
    );
  }
  
}



const alertsAPIV1 = new AlertsAPIV1();
export default alertsAPIV1
