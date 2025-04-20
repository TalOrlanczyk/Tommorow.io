## Features

- Scheduled alert evaluation every 5 minutes
- MongoDB integration for alert storage
- Real-time weather data fetching from Tomorrow.io
- Alert status management (triggered/notTriggered)

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v14 or higher)
- npm (v6 or higher)
- MongoDB (v4.4 or higher)

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
# Tomorrow.io API Key
TOMORROW_API_KEY=<YOUR_TOMORROW_API_KEY>
TOMORROW_API_URL=https://api.tomorrow.io/v4
```

4. Start the development server
```bash
npm run dev
# or
yarn dev
```


## Future Improvements

1. Support Sending notifications based on user preferences
2. Support for more weather parameters
3. Track notification service performance metrics to enhance system monitoring
4. Implement Husky pre-commit hooks with ESLint validation to maintain consistent code style
