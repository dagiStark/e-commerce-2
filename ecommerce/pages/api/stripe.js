const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

export default async function handler(req, res) {
  switch (req.method) {
    case 'POST':
      try {
        const params = {
          submit_type: '',
          mode: '',
          payment_method_types: '',
          billing_address_collection: 'auto',
          shipping_options: [{shipping_rate: 'shr_1Pfmv8RvOwan2XKgDkOOplpL'}, {shipping_rate: 'shr_1Pfna0RvOwan2XKgYy0LL7XT'}],
          ui_mode: 'embedded',
          line_items: [
            {
              // Provide the exact Price ID (for example, pr_1234) of
              // the product you want to sell
              price: '{{PRICE_ID}}',
              quantity: 1,
            },
          ],
          mode: 'payment',
          return_url: `${req.headers.origin}/return?session_id={CHECKOUT_SESSION_ID}`,
        }

        // Create Checkout Sessions from body params.
        const session = await stripe.checkout.sessions.create(params)

        res.send({clientSecret: session.client_secret})
      } catch (err) {
        res.status(err.statusCode || 500).json(err.message)
      }
      break
    case 'GET':
      try {
        const session = await stripe.checkout.sessions.retrieve(req.query.session_id)

        res.send({
          status: session.status,
          customer_email: session.customer_details.email,
        })
      } catch (err) {
        res.status(err.statusCode || 500).json(err.message)
      }
      break
    default:
      res.setHeader('Allow', req.method)
      res.status(405).end('Method Not Allowed')
  }
}
