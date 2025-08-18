console.log("DEBUG Shopify Domain:", process.env.SHOPIFY_STORE_DOMAIN);

export async function POST(req) {
  const body = await req.json();
  const { customer, cart } = body;

  try {
    const res = await fetch(
      `${process.env.SHOPIFY_STORE_URL}/admin/api/2024-07/draft_orders.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": process.env.SHOPIFY_ADMIN_API_TOKEN,
        },
        body: JSON.stringify({
          draft_order: {
            line_items: cart.map((p) => ({
              title: `${p.name} (${p.size})`,
              price: p.price,
              quantity: 1,
            })),
            customer: {
              first_name: customer.name,
              email: customer.email,
              company: customer.company,
            },
            shipping_address: {
              address1: customer.address,
            },
          },
        }),
      }
    );

    const data = await res.json();

    if (!res.ok) throw new Error(JSON.stringify(data));

    return new Response(
      JSON.stringify({ success: true, order: data.draft_order }),
      { status: 200 }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { status: 500 }
    );
  }
}
