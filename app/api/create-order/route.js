// app/api/create-order/route.js
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();

    if (!process.env.SHOPIFY_STORE_URL || !process.env.SHOPIFY_ADMIN_API_TOKEN) {
      console.error("Missing Shopify environment variables");
      return NextResponse.json(
        { error: "Missing Shopify environment variables" },
        { status: 500 }
      );
    }

    if (!body.cart || body.cart.length === 0) {
      console.error("No items provided in order body:", body);
      return NextResponse.json(
        { error: "No items provided in order body" },
        { status: 400 }
      );
    }

    // Convert cart items into Shopify line_items
    const line_items = body.cart.map((item) => ({
      title: `${item.name} — ${item.size}`,
      quantity: item.quantity,
      price: item.price.toString(), // Shopify requires string
    }));

    const orderPayload = {
      order: {
        line_items,
        customer: {
          first_name: body.company, // Company shows as "Customer Name"
          last_name: "",             // Blank so no surname
          email: body.email,
          tags: ["4reo"],            // Add the "4reo" tag
        },
        shipping_address: {
          name: body.company,        // Only company name
          company: body.company,
          address1: body.address,
          zip: body.postcode,
          country: "GB",
        },
        billing_address: {
          name: body.company,
          company: body.company,
          address1: body.address,
          zip: body.postcode,
          country: "GB",
        },
        financial_status: "pending", // Could also be "paid" if you want auto-paid
        tags: ["4reo"],              // Order tagged too
      },
    };

    const response = await fetch(
      `https://${process.env.SHOPIFY_STORE_URL}/admin/api/2025-01/orders.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": process.env.SHOPIFY_ADMIN_API_TOKEN,
        },
        body: JSON.stringify(orderPayload),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Shopify API Error:", data);
      return NextResponse.json(
        { error: "Shopify API Error", details: data },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true, order: data.order });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Unexpected error", details: error.message },
      { status: 500 }
    );
  }
}
