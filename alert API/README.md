# Alert API

A real-time alert monitoring system built with Node.js, TypeScript, MongoDB, and Socket.IO.

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.0 or higher)
- TypeScript

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd alert-api
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
PORT=3001
MONGODB_URI=<YOUR_MONGODB_URI>
SOCKET_URL=<MAIN_SERVICE_SOCKET_URL> (should be http://localhost:3000)
```

4. Start the development server
```bash
npm run dev
# or
yarn dev
```

## API Endpoints

### Get Alerts

```http
GET /api/v1/alerts
```

Query Parameters:
- `limit` (optional): Number of items per page (default: 10, max: 100)
- `cursor` (optional): Cursor for pagination
- `direction` (optional): 'next' or 'previous' for pagination direction

Response:
```json
{
  "items": [
    {
      "_id": "string",
      "name": "string",
      "description": "string",
      "parameter": "string",
      "location": "string",
      "threshold": {
        "operator": "gt" | "lt" | "eq" | "gte" | "lte",
        "value": number
      },
      "status": "string",
      "createdAt": "string",
      "updatedAt": "string"
    }
  ],
  "pageInfo": {
    "hasNextPage": boolean,
    "hasPreviousPage": boolean,
    "nextCursor": "string",
    "previousCursor": "string"
  }
}
```

### Create Alert

```http
POST /api/v1/alerts
```

Request Body:
```json
{
  "name": "string (optional)",
  "description": "string (optional)",
  "parameter": "string",
  "location": "string (lat,long)",
  "threshold": {
    "operator": "gt" | "lt" | "eq" | "gte" | "lte",
    "value": number
  }
}
```

Headers:
- `x-user-id`: User ID for authentication

## WebSocket Events

### Server-side Events


1. Alert Status Changed:
```typescript
socket.on('alertStatusChanged', (data) => {
  // Handle status change
});
enable us to alert the socket service that a status change and send it to a user.
```