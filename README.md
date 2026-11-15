# Product Management System

A RESTful Product Management System built using Spring Boot, Spring Data JPA, and MySQL.

## Technologies Used

- Java 21
- Spring Boot 4.0.9
- Spring Data JPA
- MySQL 8.0
- Maven
- Hibernate
- Postman

## Features

- Create, view, update, and delete products.
- Search products by category.
- Filter products based on minimum price.
- Retrieve products with the highest stock.
- Automatic low-stock warnings.
- Input validation and exception handling.
- RESTful API architecture.

## Database Configuration

Create a MySQL database:

```sql
CREATE DATABASE product_management_db;
```

Configure your database credentials using the `DB_PASSWORD` environment variable.

Update `application.properties` if your database configuration differs.

## API Endpoints

Base URL: `http://localhost:8080/api/v1/products`

| Method | Endpoint | Description |
|---|---|---|
| POST | `/` | Create product |
| GET | `/` | Get all products |
| GET | `/{productId}` | Get product by ID |
| PUT | `/{productId}` | Update product |
| DELETE | `/{productId}` | Delete product |
| GET | `/reports/price?minPrice=1000` | Filter by minimum price |
| GET | `/reports/category?category=Electronics` | Filter by category |
| GET | `/reports/top-stock?limit=5` | Get highest-stock products |

## Running the Project

1. Install Java 21 and MySQL.
2
