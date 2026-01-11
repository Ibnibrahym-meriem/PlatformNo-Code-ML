
#  DataFlow: End-to-End No-Code Data Science Platform

![Project Status](https://img.shields.io/badge/Status-Prototype-orange)
![Python](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/Frontend-React-61DAFB?logo=react&logoColor=black)
![License](https://img.shields.io/badge/License-MIT-green)

> **Transform raw data into AI models without writing a single line of code.**

**DataFlow** is a web application designed to democratize Data Science. It allows non-technical users to ingest data from various sources (files, Kaggle, Web Scraping), automatically clean it, visualize it, and train Machine Learning models through an intuitive interface.

---

## 🚀 Key Features

### 1. 📥 Multi-Source Data Ingestion
- **File Upload:** Support for CSV, Excel, and JSON.
- **Kaggle Integration:** Search and download datasets directly via API keys.
- **Advanced Web Scraping:** Uses **Playwright** to scrape dynamic (SPA) websites.
- **Data Generation:** Create synthetic datasets with custom business rules.

### 2. 🧹 Smart Preprocessing (Auto-Clean)
- **Automated Pipeline:** One-click cleaning (handling missing values, encoding text, scaling).
- **Outlier Detection:** IQR and Z-Score methods.
- **Balancing:** SMOTE and Random Sampling for imbalanced datasets.

### 3. 📊 Interactive Visualization (EDA)
- Dynamic generation of histograms, boxplots, and correlation heatmaps.
- Statistical summaries (Mean, Std, Quartiles).

### 4. 🤖 AutoML & Model Training
- **Auto-Detection:** Automatically identifies if the task is Regression, Classification, or Clustering.
- **Multi-Model Training:** Trains multiple algorithms (Random Forest, SVM, XGBoost, etc.) in parallel.
- **Performance Report:** Generates a downloadable PDF report with metrics (F1-Score, RMSE) and confusion matrices.

---

## 🛠️ Tech Stack

### Backend
- **Framework:** [FastAPI](https://fastapi.tiangolo.com/) (Async, High Performance)
- **Data Processing:** Pandas, NumPy
- **Machine Learning:** Scikit-Learn, Imbalanced-learn
- **Scraping:** Playwright (Headless Browser)
- **Database:** SQLite (via `aiosqlite` & SQLAlchemy)
- **PDF Generation:** FPDF

### Frontend
- **Framework:** React.js, Vite
- **Styling:** CSS Modules / Tailwind
- **Charting:** Recharts
- **HTTP Client:** Axios

---

## ⚙️ Installation & Setup

### Prerequisites
- Python 3.9+
- Node.js & npm
- Git

### 1. Clone the Repository
```bash
git clone [https://github.com//ElMansouriAya/No-Code-ML-Platform.git](https://github.com//ElMansouriAya/No-Code-ML-Platform.git)
cd No-Code-ML-Platform
```

### 2. Backend Setup

Navigate to the root folder and set up the Python environment.

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Install Playwright browsers (Crucial for scraping)
playwright install

```

### 3. Frontend Setup

Navigate to the frontend folder and install Node packages.

```bash
# Open a new terminal
cd no-code-ml-frontend

# Install dependencies
npm install

```

---

## ▶️ Usage

### Start the Backend Server

```bash
# Inside the root folder (with venv activated)
python run.py

```

* The API will be available at: `http://127.0.0.1:8005`
* API Documentation (Swagger): `http://127.0.0.1:8005/docs`

### Start the Frontend Client

```bash
# Inside /no-code-ml-frontend folder
npm start

```

* The application will open at `http://localhost:3000`

---

## 🤝 Contributing

This project was developed as part of a **Master 1 Data Science** project.

**The Team:**

* **EL MANSOURI AYA**
* **EL RHORBA AYA**
* **IBN IBRAHYM MERIEM**

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.


