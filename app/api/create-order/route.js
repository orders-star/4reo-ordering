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

  if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
    console.error("No items provided in order body:", body);
    return NextResponse.json(
      { error: "No items provided in order body" },
      { status: 400 }
    );
  }

  // Map variant IDs to prices
  const priceMap = {
    "56109627736438": "20.00",   // Milky Way 1kg
    "56109627769206": "140.00",  // Milky Way 8kg
    "56109631504758": "18.00",   // Wakey Wakey 1kg
    "56109631537526": "120.00",  // Wakey Wakey 8kg
    "56109634191734": "17.00",   // Easy Peasy 1kg
    "56109634224502": "115.00",  // Easy Peasy 8kg
  };

  try {
    const line_items = body.items.map(item => ({
      variant_id: item.variant_id,
      quantity: item.quantity,
      price: priceMap[item.variant_id.toString()] || "0.00"
    }));

    const orderPayload = {
      order: {
        email: body.email,
        send_receipt: true,
        send_fulfillment_receipt: false,
        line_items,
        shipping_address: {
          name: body.name,
          company: body.company,
          address1: body.address,
          zip: body.postcode,
          country: "GB",
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

    const data = await response.json();

    if (!response.ok) {
      console.error("Shopify API Error:", data);
      return NextResponse.json({ error: data }, { status: response.status });
    }

    return NextResponse.json({ success: true, order: data });
  } catch (err) {
    console.error("Shopify API Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
