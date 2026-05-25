# SolidarianID - Social Impact Microservices Platform

> **Note:** This is a personal fork of the [Original Project](https://github.com/misum-grupo-2/solidarianid) developed as the Core Capstone Project for my Master's degree in Software Engineering at the University of Murcia.
>
> _Disclaimer:_ Because this is an academic project, the architecture deliberately integrates a wider and more heterogenous mix of technologies, databases, and patterns than a typical streamlined production environment. This was done to evaluate and benchmark different architectural approaches.

## 🎯 Project Overview

SolidarianID is a scalable, cloud-native platform designed to manage social impact initiatives, donations, and volunteering. Built from the ground up utilizing **Domain-Driven Design (DDD)** and **Hexagonal Architecture**, the system ensures high cohesion, low coupling, and strict separation of concerns.

## 💻 Tech Stack

**Backend & Core:**

- TypeScript / Node.js
- NestJS
- API Gateway Pattern (Exposing both REST and GraphQL interfaces)

**Data & Persistence:**

- PostgreSQL (Primary relational data & Read Models via TypeORM)
- Redis (Caching)
- KurrentDB (Event Store)

**Cloud, DevOps & Infrastructure:**

- AWS (CloudFormation, VPC networking)
- Kubernetes (Amazon EKS) & Docker
- GitHub Actions (CI/CD Pipelines)

## 🧠 Architecture & Engineering Impact

As a core contributor, I focused on designing a resilient, fault-tolerant backend infrastructure capable of handling complex transactional domains and high-concurrency workloads. My key implementations include:

- **Microservices in a Monorepo:** Structured the platform as a distributed system, enforcing strict domain boundaries using **Domain-Driven Design (DDD)** and **Hexagonal Architecture** (Ports & Adapters) to completely isolate core business logic from external frameworks.
- **Hybrid Distributed Communication:** Designed a hybrid communication strategy for the distributed system, leveraging **NATS** for decoupled, asynchronous event-driven flows and **gRPC** for high-performance, low-latency synchronous inter-service calls.
- **Tactical CQRS & Event Sourcing:** Engineered the resilient data layer supporting the platform's secure payment processing (integrated with the **Stripe** API) of the `Funding/Donations` microservice. Utilized **KurrentDB** as an Event Store to guarantee an immutable audit trail of financial transactions, while projecting optimized Read Models into **PostgreSQL**.
- **Cloud-Native Provisioning:** Designed and deployed the production-grade infrastructure on AWS. Managed VPC networking and orchestrated the deployment lifecycle on an **Amazon EKS** Kubernetes Cluster using Infrastructure as Code (IaC).

## 🚀 Quick Start (Docker)

The platform and its entire distributed infrastructure are fully containerized. You can spin up the complete microservices environment locally using Docker Compose:

```bash
# 1. Configure environment variables
cp .env.example .env

# 2. Generate secret files for DB passwords, JWT, and session secrets (requires bash + openssl)
./scripts/generate-secrets.sh

# 3. Install dependencies
npm install

# 4. Generate VAPID keys for Push Notifications and append them to .env
npm run vapid:gen -- .env

# 5. Set the remaining credentials manually in .env:
# - NEXTAUTH_SECRET: run `openssl rand -base64 32` and paste the output
# - GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET: obtain from Google Cloud Console

# 6. Build and start all microservices and databases
docker-compose up -d --build
```

---

_If you are a technical lead or recruiter, feel free to explore the `/apps` and `/libs/shared` directories to review the implementation of the domain models, event projectors, infrastructure adapters, and application services._
