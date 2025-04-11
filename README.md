# 📊 Sales Dashboard

> A web-based dashboard that visualizes sales metrics and performance indicators to empower data-driven decision-making for sales teams.

🔗 **Live Site:** _[Add live URL if deployed]_

![Sales Dashboard Screenshot](./screenshot.png)

## ✨ Features

- 📈 View sales KPIs: revenue, lead conversions, CAC
- 📊 Interactive charts powered by Chart.js
- ⚙️ RESTful API with Express.js
- 💾 Local storage using SQLite
- 🌐 Fast and responsive interface (frontend with React.js)
- 🔐 Secure API design

## 🧰 Tech Stack

- **Backend:** Node.js, Express.js, SQLite  
- **Frontend:** React.js, Chart.js  
- **Version Control:** Git, GitHub

## 🛠️ Backend Installation & Setup

Follow these steps to set up the backend locally:

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/sales-dashboard.git
cd sales-dashboard/backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Initialize the SQLite Database

```bash
node db/init.js
```

This will generate `sales.db` with required schema and sample data.

### 4. Start the Server

```bash
npm start
```

Server will start at [http://localhost:5000](http://localhost:5000)

### 5. Available API Endpoints

| Method | Endpoint         | Description                      |
|--------|------------------|----------------------------------|
| GET    | `/api/metrics`   | Returns key performance metrics |
| GET    | `/api/sales`     | Returns sales data for charts   |

## 📄 License

MIT License © Sharnjeet Singh

## 👤 Author

**Sharnjeet Singh**  
[LinkedIn](https://linkedin.com/in/sharnjeetsingh21)  
[Portfolio](https://your-portfolio.com)

> Empowering smarter sales with insightful dashboards.
