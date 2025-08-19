// app/api/create-order/route.js
import { NextResponse } from "next/server";

export async function POST(req) {
  const body = await req.json();

  const SHOPIFY_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
  const SHOPIFY_TOKEN = process.env.SHOPIFY_ADMIN_API_TOKEN;

  if (!SHOPIFY_DOMAIN || !SHOPIFY_TOKEN) {
    console.error("Missing Shopify environment variables");
    return NextResponse.json(
      { error: "Missing Shopify environment variables" },
      { status: 500 }
    );
  }

  if (!body.cart || !Array.isArray(body.cart) || body.cart.length === 0) {
    console.error("No cart provided in order body:", body);
    return NextResponse.json(
      { error: "No cart provided in order body" },
      { status: 400 }
    );
  }

  // Map blend + size → Shopify variant_id and price
  const variantMap = {
    "Milky Way Blend_1kg Bag": { id: 56109627736438, price: "20.00" },
    "Milky Way Blend_8kg Bucket": { id: 56109627769206, price: "140.00" },
    "Wakey Wakey Blend_1kg Bag": { id: 56109631504758, price: "18.00" },
    "Wakey Wakey Blend_8kg Bucket": { id: 56109631537526, price: "120.00" },
    "Easy Peasy Blend_1kg Bag": { id: 56109634191734, price: "17.00" },
    "Easy Peasy Blend_8kg Bucket": { id: 56109634224502, price: "115.00" },
  };

  try {
    const line_items = body.cart.map(item => {
      const key = `${item.name}_${item.size}`;
      const variant = variantMap[key];

      if (!variant) {
        throw new Error(`Unknown product variant: ${key}`);
      }

      return {
        variant_id: variant.id,
        quantity: item.quantity,
        price: variant.price,
      };
    });

    const orderPayload = {
      order: {
        email: body.email,
        tags: "4reo", // 👈 tag order
        send_receipt: true,
        send_fulfillment_receipt: false,
        note: `Company: ${body.company}`, // 👈 show company name as a note
        line_items,
        shipping_address: {
          name: body.company || body.name, // 👈 use company name as "customer name"
          company: body.company,
          address1: body.address,
          zip: body.postcode,
          country: "GB",
        },
        customer: {
          first_name: body.company || body.name, // 👈 customer record shows company
          email: body.email,
          tags: ["4reo"], // 👈 tag customer
        },
      },
    };

    const response = await fetch(
      `https://${SHOPIFY_DOMAIN}/admin/api/2024-07/orders.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": SHOPIFY_TOKEN,
        },
        body: JSON.stringify(orderPayload),
      }
    );
