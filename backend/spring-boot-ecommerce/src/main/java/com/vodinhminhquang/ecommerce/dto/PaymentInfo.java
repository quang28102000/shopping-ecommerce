package com.vodinhminhquang.ecommerce.dto;

import lombok.Data;

@Data
public class PaymentInfo {

    // stripe api convert $ to cents
    private Integer amount;
    private String currency;
    private String receiptEmail;

}
