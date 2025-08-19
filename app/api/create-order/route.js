// app/api/create-order/route.js

export async function POST(req) {
  try {
    const body = await req.json();

    const SHOPIFY_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN; // e.g. deluxe-coffeeworks-london.myshopify.com
    const SHOPIFY_TOKEN = process.env.SHOPIFY_ADMIN_API_TOKEN;

    if (!SHOPIFY_DOMAIN || !SHOPIFY_TOKEN) {
      console.error("Missing Shopify environment variables");
      return new Response(
        JSON.stringify({ error: "Missing Shopify environment variables" }),
        { status: 500 }
      );
    }

    // Build Shopify order payload
    const orderPayload = {
      order: {
        line_items: body.cart.map((item) => ({
          variant_id: item.id,   // Shopify variant ID
          quantity: item.quantity,
        })),
        customer: {
          first_name: body.name,
          email: body.email,
          company: body.company,
        },
        shipping_address: {
          address1: body.address,
          city: body.city || "",
          zip: body.postcode || "",
          country: "United Kingdom",
        },
        financial_status: "pending", // You can change to "paid" if charging
        tags: "Wholesale-Ordering-App",
      },
    };

    // Send to Shopify Orders API
    const response = await fetch(
      `https://${SHOPIFY_DOMAIN}/admin/api/2023-07/orders.json`,
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
      return new Response(
        JSON.stringify({ error: data }),
        { status: response.status }
      );
    }

    return new Response(
      JSON.stringify({ success: true, order: data.order }),
      { status: 200 }
    );

  } catch (error) {
    console.error("ERROR in create-order:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500 }
    );
  }
}

