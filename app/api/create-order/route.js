export async function POST(req) {
  try {
    const body = await req.json();

    console.log("DEBUG Shopify Domain:", process.env.SHOPIFY_STORE_DOMAIN);
    console.log("DEBUG Token present:", !!process.env.SHOPIFY_ADMIN_ACCESS_TOKEN);

    const response = await fetch(
      `https://${process.env.SHOPIFY_STORE_DOMAIN}/admin/api/2024-07/draft_orders.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": process.env.SHOPIFY_ADMIN_ACCESS_TOKEN,
        },
        body: JSON.stringify({
          draft_order: {
            line_items: body.cart.map((item) => ({
              title: item.name,
              price: item.price,
              quantity: item.quantity,
            })),
            shipping_address: {
              address1: body.address,
              company: body.company,
              name: body.name,
            },
            email: body.email,
          },
        }),
      }
    );

    const data = await response.json();
    console.log("DEBUG Shopify response:", data);

    return new Response(JSON.stringify(data), { status: 200 });
  } catch (error) {
    console.error("ERROR in create-order:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
