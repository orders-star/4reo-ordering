import { NextResponse } from "next/server";

const SHOPIFY_STORE_URL = process.env.SHOPIFY_STORE_URL;
const SHOPIFY_ADMIN_API_KEY = process.env.SHOPIFY_ADMIN_API_KEY;

const VARIANT_MAP = {
  "Milky Way Blend": {
    "1kg Bag": "56109627736438",
    "8kg Bucket": "56109627769206"
  },
  "Wakey Wakey Blend": {
    "1kg Bag": "56109631504758",
    "8kg Bucket": "56109631537526"
  },
  "Easy Peasy Blend": {
    "1kg Bag": "56109634191734",
    "8kg Bucket": "56109634224502"
  }
};

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, email, company, address, postcode, cart } = body;

    if (!cart || cart.length === 0) {
      return NextResponse.json({ success: false, error: "Cart is empty" });
    }

    // Build Shopify line items
    const line_items = cart.map((item) => {
      const variantId = VARIANT_MAP[item.name][item.size];
      return {
        variant_id: variantId,
        quantity: item.quantity
      };
    });

    // Build order payload
    const orderPayload = {
      order: {
        line_items,
        customer: {
          first_name: name || "Guest",
          email: email || "noemail@example.com"
        },
        shipping_address: {
          first_name: name,
          address1: address,
          company: company,
          zip: postcode,
          country: "UK"
        },
        tags: "4REO Ordering",
        financial_status: "paid" // ✅ Automatically marked as paid
      }
    };

    // Send to Shopify Orders API
    const response = await fetch(
      `https://${SHOPIFY_STORE_URL}/admin/api/2025-01/orders.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": SHOPIFY_ADMIN_API_KEY
        },
        body: JSON.stringify(orderPayload)
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Shopify API Error:", data);
      return NextResponse.json({ success: false, error: data });
    }

    return NextResponse.json({ success: true, order: data.order });
  } catch (err) {
    console.error("Shopify API Error:", err);
    return NextResponse.json({ success: false, error: err.message });
  }
}
