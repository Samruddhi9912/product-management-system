
package com.samruddhi.productmanagement.service;

import java.math.BigDecimal;
import java.util.List;

import com.samruddhi.productmanagement.dto.ProductDTO;

public interface ProductService {

    ProductDTO createProduct(ProductDTO productDTO);

    List<ProductDTO> getAllProducts();

    ProductDTO getProductById(Integer productId);

    ProductDTO updateProduct(Integer productId, ProductDTO productDTO);

    void deleteProduct(Integer productId);

    List<ProductDTO> getProductsByMinPrice(BigDecimal minPrice);

    List<ProductDTO> getProductsByCategory(String category);

    List<ProductDTO> getTopStockProducts(Integer limit);
}
