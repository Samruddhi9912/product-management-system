
package com.samruddhi.productmanagement.repository;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.samruddhi.productmanagement.entity.Product;

public interface ProductRepository extends JpaRepository<Product, Integer> {

    // Find products with price greater than or equal to the given amount
    List<Product> findByPriceGreaterThanEqual(BigDecimal minPrice);

    // Find products by category (case-insensitive)
    List<Product> findByCategoryIgnoreCase(String category);

    // Find products sorted by quantity in descending order
    List<Product> findByOrderByQuantityDesc(Pageable pageable);
}
