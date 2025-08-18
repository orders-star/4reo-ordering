export async function POST(req) {
  try {
    const body = await req.json();

    const SHOPIFY_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
    const ACCESS_TOKEN = process.env.SHOPIFY_ADMIN_API_ACCESS_TOKEN;

    if (!SHOPIFY_DOMAIN || !ACCESS_TOKEN) {
      return new Response(
        JSON.stringify({ error: "Missing Shopify environment variables" }),
        { status: 500 }
      );
    }

    const draftOrder = {
      draft_order: {
        line_items: body.cart.map(item => ({
          title: item.title,
          price: item.price,
          quantity: item.quantity || 1, // ensure minimum 1
        })),
        note: `Order from ${body.company} (${body.name}, ${body.email})`,
        shipping_address: {
          address1: body.address,
        },
        customer: {
          first_name: body.name,
          email: body.email,
        },
      },
    };

    const response = await fetch(
      `https://${SHOPIFY_DOMAIN}/admin/api/2024-07/draft_orders.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": ACCESS_TOKEN,
        },
        body: JSON.stringify(draftOrder),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Shopify API Error:", data);
      return new Response(JSON.stringify(data), { status: 500 });
    }

    return new Response(JSON.stringify(data), { status: 200 });
  } catch (error) {
    console.error("ERROR in create-order:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
