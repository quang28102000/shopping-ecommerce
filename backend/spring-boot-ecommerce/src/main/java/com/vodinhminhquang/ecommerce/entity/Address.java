package com.vodinhminhquang.ecommerce.entity;

import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;

@Entity
@Table(name = "address")
@Getter
@Setter
public class Address {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "street")
    private String street;

    @Column(name = "city")
    private String city;

    @Column(name = "state")
    private String state;

    @Column(name = "country")
    private String country;

    @Column(name = "zip_code")
    private String zipCode;

    // Join using primary keys
    // (by default keys have same name)
    // DEFINITION:
    // Specifies a primary key column that is used as a foreign key to join to another table
    @OneToOne
    @PrimaryKeyJoinColumn
    private Order order;
}
