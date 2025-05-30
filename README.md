
# 💰 Simple Banking System with Transaction Management

A simple React-based banking system that simulates core banking transactions — **deposit**, **withdrawal**, and **transfer** — while ensuring **transaction atomicity and recovery** in the event of a system crash. This project focuses on database recovery techniques and adheres to the **ACID** properties, particularly **atomicity**.

---

## 📌 Features

- Deposit money into an account
- Withdraw money from an account
- Transfer money between accounts
- Simulate a system crash during a transaction
- Maintain a **transaction log** to track all operations
- Implement **rollback and recovery** mechanisms to ensure data consistency

---

## 🎯 Learning Objectives

This project demonstrates:

- **Transaction Management**: Each operation (deposit, withdraw, transfer) is treated as an independent transaction.
- **ACID Properties**: Ensures **atomicity**, where a transaction is either fully completed or not executed at all.
- **Database Recovery**: Simulates crashes and restores the database to a consistent state using rollback techniques.
- **Transaction Logging**: Records every operation to enable rollback in case of failure.

---

## 🧰 Tech Stack

- **Frontend**: React.js
- **State Management**: React Context API / useReducer
- **Logging & Recovery**: Custom implementation (in-memory or localStorage-based)
- **Crash Simulation**: Manual trigger to simulate a crash

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/JV-Vigneesh/banking-system-transaction-management.git
cd banking-system-transaction-management
````

### 2. Install Dependencies

```bash
npm install
```

### 3. Run the Application

```bash
npm start
```

The app will be available at `http://localhost:3000`.

---

## ⚙️ Simulating a Crash

To simulate a crash:

1. Initiate a **deposit or transfer** transaction.
2. Trigger a "Crash" (via a crash button or programmatically).
3. On app reload, the system will check the transaction log and **rollback** any incomplete transactions.

---

## 🛠️ Recovery Mechanism

* **Before Commit**: All transaction steps are logged.
* **On Crash**: Incomplete transactions are detected using the log.
* **On Recovery**: Logs are replayed or reversed to restore a consistent state.

---

## ✅ Future Improvements

* Integration with a backend and persistent database (e.g., Node.js + MongoDB)
* Support for concurrent transactions
* User authentication
* Improved UI/UX for better interaction

---

## 📚 References

* ACID Properties: [Wikipedia](https://en.wikipedia.org/wiki/ACID)
* Transaction Management in Databases
* React Context and Reducer patterns

---

## 📄 License

This project is licensed under the MIT License.

---
