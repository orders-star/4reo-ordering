// app/api/create-order/route.js
import { NextResponse } from "next/server";

// --- Your variant + price mapping ---
const VARIANT_MAP = {
  "Milky Way Blend": {
    "1kg Bag": "56109627736438",
    "8kg Bucket": "56109627769206",
  },
  "Wakey Wakey Blend": {
    "1kg Bag": "56109631504758",
    "8kg Bucket": "56109631537526",
  },
  "Easy Peasy Blend": {
    "1kg Bag": "56109634191734",
    "8kg Bucket": "56109634224502",
  },
};

const PRICE_MAP = {
  "56109627736438": "20.00",   // Milky Way 1kg
  "56109627769206": "140.00",  // Milky Way 8kg
  "56109631504758": "18.00",   // Wakey Wakey 1kg
  "56109631537526": "120.00",  // Wakey Wakey 8kg
  "56109634191734": "17.00",   // Easy Peasy 1kg
  "56109634224502": "115.00",  // Easy Peasy 8kg
};

// Simple diagnostic endpoint so you can visit /api/create-order in a browser
export async function GET() {
  return NextResponse.json({
    ok: true,
    expectsEnv: ["SHOPIFY_STORE_DOMAIN", "SHOPIFY_ADMIN_API_TOKEN"],
    envPresent: {
      SHOPIFY_STORE_DOMAIN: !!process.env.SHOPIFY_STORE_DOMAIN,
      SHOPIFY_ADMIN_API_TOKEN: !!process.env.SHOPIFY_ADMIN_API_TOKEN,
    },
    domain: process.env.SHOPIFY_STORE_DOMAIN || null,
    message: "POST to this endpoint to create a Shopify order.",
  });
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, email, company, address, postcode, cart } = body;

    const SHOPIFY_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;     // e.g. deluxecoffeeworkslondon.myshopify.com
    const SHOPIFY_TOKEN  = process.env.SHOPIFY_ADMIN_API_TOKEN;  // Admin API access token

    // Env guard (shows which one is missing)
    if (!SHOPIFY_DOMAIN || !SHOPIFY_TOKEN) {
      console.error("Missing Shopify env vars:", {
        SHOPIFY_STORE_DOMAIN_present: !!SHOPIFY_DOMAIN,
        SHOPIFY_ADMIN_API_TOKEN_present: !!SHOPIFY_TOKEN,
      });
      return NextResponse.json(
        { success: false, error: "Server misconfigured: missing Shopify environment variables." },
        { status: 500 }
      );
    }

    // Cart guard
    if (!Array.isArray(cart) || cart.length === 0) {
      return NextResponse.json(
        { success: false, error: "No items provided in order body." },
        { status: 400 }
      );
    }

    // Build Shopify line_items with variant_id + price
    const line_items = cart.map((item) => {
      const variantId = VARIANT_MAP[item.name]?.[item.size];
      if (!variantId) {
        throw new Error(`Unknown product variant: ${item.name} — ${item.size}`);
      }
      const price = PRICE_MAP[String(variantId)];
      return {
        variant_id: Number(variantId),
        quantity: Math.max(1, Number(item.quantity || 1)),
        price, // explicit price to avoid "price must be provided" errors
      };
    });

    const orderPayload = {
      order: {
        line_items,
        email: email || undefined,
        send_receipt: true,
        send_fulfillment_receipt: false,
        tags: "4reo",
        financial_status: "paid",      // goes straight into Orders as PAID
        currency: "GBP",
        note: company ? `Company: ${company}` : undefined,

        // Show company in customer name (no surname)
        customer: {
          first_name: company || "Customer",
          last_name: "",
          email: email || undefined,
          tags: ["4reo"],
        },

        // Shipping name shows company only
        shipping_address: {
          first_name: company || "Customer",
          last_name: "",
          company: company || undefined,
          address1: address || "",
          zip: postcode || "",
          country: "GB",
        },

        // Optional: billing same as shipping
        billing_address: {
          first_name: company || "Customer",
          last_name: "",
          company: company || undefined,
          address1: address || "",
          zip: postcode || "",
          country: "GB",
        },
      },
    };

    // Call Shopify Orders API
    const resp = await fetch(`https://${SHOPIFY_DOMAIN}/admin/api/2024-07/orders.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": SHOPIFY_TOKEN,
      },
      body: JSON.stringify(orderPayload),
    });

    const data = await resp.json();

    if (!resp.ok) {
      console.error("Shopify API Error:", data);
      return NextResponse.json({ success: false, error: data }, { status: 502 });
    }

    return NextResponse.json({ success: true, order: data.order });
  } catch (err) {
    console.error("ERROR in create-order:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
