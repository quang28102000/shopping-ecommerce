package com.vodinhminhquang.ecommerce.dao;

import com.vodinhminhquang.ecommerce.entity.Product;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.web.bind.annotation.RequestParam;

@RepositoryRestResource
public interface ProductRepository extends JpaRepository<Product, Long> {

    // Spring Data REST & Spring Data JPA supports "query methods"
    // which means it is gonna construct a query based on method naming convention

    Page<Product> findByCategoryId(@RequestParam("id") Long id, Pageable pageable);
    // ~ SELECT * FROM Product p WHERE p.name LIKE CONCAT('%', :name, '%')
    Page<Product> findByNameContaining(@RequestParam("name") String name, Pageable pageable);
}
