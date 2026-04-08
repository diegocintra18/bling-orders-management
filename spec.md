# 📘 spec.md — Architecture & Code Standards (SOLID)

## 🎯 Objective

This document defines architecture patterns, code organization, and best practices for the Bling integration project, ensuring scalability, maintainability, and clear responsibility separation.

---

## 🧱 Base Stack

* Backend: NestJS
* Frontend: Next.js
* Database: MongoDB
* Authentication: JWT
* Integrations: Bling API + Webhooks

---

## 🧩 General Architecture

The project follows a **modular + domain-driven structure**, separating responsibilities:

```
/apps
  /api        → Backend (NestJS)
  /web        → Frontend (Next.js)

/packages
  /core       → Pure business logic
  /infra      → External integrations (Bling, DB, queues)
```

---

## 🧠 SOLID Principles

### 1. Single Responsibility Principle (SRP)

Each class must have **only one responsibility**.

✅ Correct:

* `CreateOrderService` → handles order creation
* `CheckDelayedOrdersService` → handles delay validation

❌ Incorrect:

* A service that creates orders, processes webhooks, and checks delays

---

### 2. Open/Closed Principle (OCP)

Code should be **open for extension, closed for modification**.

✅ Example:

```
interface BlingProvider {
  fetchOrders(): Promise<Order[]>;
}
```

---

### 3. Liskov Substitution Principle (LSP)

Implementations must be interchangeable without breaking behavior.

---

### 4. Interface Segregation Principle (ISP)

Avoid large, generic interfaces.

❌ Incorrect:

```
interface BlingService {
  createOrder()
  cancelOrder()
  getProducts()
  getInvoices()
}
```

✅ Correct:

```
interface BlingOrderService {
  createOrder()
}

interface BlingProductService {
  getProducts()
}
```

---

### 5. Dependency Inversion Principle (DIP)

Depend on abstractions, not implementations.

```
constructor(private readonly orderRepository: OrderRepository) {}
```

---

## 📂 Backend Folder Structure

```
/src
  /modules
    /auth
    /orders
    /bling
    /accounts
    /tracking

  /core
    /entities
    /interfaces

  /infra
    /database
    /bling
    /queues

  /common
    /decorators
    /guards
    /middlewares
```

---

## 🔐 Authentication (Frontend + Backend)

### Backend

* JWT with refresh token
* Global guards for protected routes

### Frontend

* Authentication middleware
* Route protection (dashboard)

---

## 👥 Multi-Account Support (Bling)

### Rule

Each account must be logically isolated.

---

### Data Models

```
Account {
  id
  name
  apiKey
  webhookToken
}
```

```
Order {
  id
  externalOrderId
  accountId
  status
  isPicked
  isDelayed
  createdAt
}
```

---

### Best Practices

* Never mix data between accounts
* Always filter queries using `accountId`
* Use request-level context for account identification

---

## 🔗 Bling Integration

### Mandatory Separation

```
/infra/bling
  bling.client.ts        → HTTP client
  bling.service.ts       → integration logic
```

---

### Rules

* Never call external APIs directly from controllers
* Always use a service layer
* Implement retry and error handling

---

## 🔔 Order Webhook

### Endpoint

```
POST /webhook/bling/:accountId
```

---

### Rules

* Validate request origin (token/signature)
* Keep processing fast (non-blocking)
* Persist data before executing business logic

---

### Flow

1. Receive webhook
2. Identify account
3. Persist order
4. Trigger async processing

---

## ⏱️ Delay Tracking

### Database Structure

```
{
  isPicked: boolean,
  createdAt: Date,
  isDelayed: boolean
}
```

---

### Logic

* Order created → `isPicked = false`
* Order picked → `isPicked = true`
* Background job:

  * If `!isPicked` and exceeds X hours → `isDelayed = true`

---

### Implementation

```
/tracking
  check-delayed-orders.service.ts
```

---

## 🔄 Jobs & Background Processing

### Rules

* Never run heavy logic inside controllers
* Use background jobs for:

  * Delay validation
  * Bling synchronization

---

### Structure

```
/jobs
  delayed-orders.job.ts
```

---

## 🧪 Code Standards

### Naming Convention

* Services: `CreateOrderService`
* Controllers: `OrdersController`
* Repositories: `OrderRepository`

---

### Controllers

* Handle request/response only
* No business logic

---

### Services

* Contain business logic
* Do not directly call external APIs

---

### Repositories

* Handle database access only

---

## 🧼 Clean Code

* Functions under 20 lines
* Descriptive naming
* Avoid unnecessary comments
* Avoid duplicated logic

---

## 🚨 Error Handling

* Never use empty `try/catch`
* Create domain-specific exceptions
* Log critical errors

---

## 📊 Observability

* Structured logging
* Always include `accountId`
* Track key events:

  * Webhook received
  * Order processed
  * Delay detected

---

## 📌 Golden Rules

1. Controllers do not contain business logic
2. Services do not directly access external infrastructure
3. Infrastructure contains no business rules
4. Everything must be testable in isolation
5. Multi-account isolation is mandatory

---

## 🚀 Future Scalability

Prepare for:

* Queue system (BullMQ / Redis)
* Additional webhooks
* New integrations beyond Bling
* Real-time dashboard metrics

---

## ✅ Conclusion

Following this standard ensures:

* Predictable code structure
* Easy scalability
* Clean separation of concerns
* Faster onboarding for new developers
* Strong foundation for advanced automation

---
