
package com.samruddhi.productmanagement.controller;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;

import com.samruddhi.productmanagement.dto.ProductDTO;
import com.samruddhi.productmanagement.service.ProductService;

@RestController
@RequestMapping("/api/v1/products")
@Validated
@CrossOrigin(origins = "http://localhost:5173")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    // Create a new product
    @PostMapping
    public ResponseEntity<ProductDTO> createProduct(
            @Valid @RequestBody ProductDTO productDTO) {

        ProductDTO createdProduct = productService.createProduct(productDTO);

        return new ResponseEntity<>(createdProduct, HttpStatus.CREATED);
    }

    // Get all products
    @GetMapping
    public ResponseEntity<List<ProductDTO>> getAllProducts() {
        return ResponseEntity.ok(productService.getAllProducts());
    }

    // Get the next available Product ID
    @GetMapping("/next-id")
    public ResponseEntity<Integer> getNextProductId() {
        return ResponseEntity.ok(productService.getNextProductId());
    }

    // Get product by ID
    @GetMapping("/{productId}")
    public ResponseEntity<ProductDTO> getProductById(
            @PathVariable Integer productId) {

        return ResponseEntity.ok(productService.getProductById(productId));
    }

    // Update an existing product
    @PutMapping("/{productId}")
    public ResponseEntity<ProductDTO> updateProduct(
            @PathVariable Integer productId,
            @Valid @RequestBody ProductDTO productDTO) {

        ProductDTO updatedProduct =
                productService.updateProduct(productId, productDTO);

        return ResponseEntity.ok(updatedProduct);
    }

    // Delete a product
    @DeleteMapping("/{productId}")
    public ResponseEntity<Void> deleteProduct(
            @PathVariable Integer productId) {

        productService.deleteProduct(productId);

        return ResponseEntity.noContent().build();
    }

    // Get products by minimum price
    @GetMapping("/reports/price")
    public ResponseEntity<List<ProductDTO>> getProductsByMinPrice(
            @RequestParam BigDecimal minPrice) {

        return ResponseEntity.ok(
                productService.getProductsByMinPrice(minPrice));
    }

    // Get products by category
    @GetMapping("/reports/category")
    public ResponseEntity<List<ProductDTO>> getProductsByCategory(
            @RequestParam String category) {

        return ResponseEntity.ok(
                productService.getProductsByCategory(category));
    }

    // Get products with highest stock
    @GetMapping("/reports/top-stock")
    public ResponseEntity<List<ProductDTO>> getTopStockProducts(
            @RequestParam(defaultValue = "5")
            @Min(value = 1, message = "Limit must be at least 1")
            Integer limit) {

        return ResponseEntity.ok(
                productService.getTopStockProducts(limit));
    }
}
