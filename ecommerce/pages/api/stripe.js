const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

export default async function handler(req, res) {
  switch (req.method) {
    case 'POST':
      try {
        const params = {
          submit_type: 'pay',
          mode: 'payment',
          payment_method_types: ['card'],
          billing_address_collection: 'auto',
          shipping_options: [
            {shipping_rate: 'shr_1Pfmv8RvOwan2XKgDkOOplpL'}, // Make sure these are live/test-mode specific
            {shipping_rate: 'shr_1Pfna0RvOwan2XKgYy0LL7XT'},
          ],
          line_items: req.body.map((item) => {
            const img = item.image[0].asset._ref
            const newImage = img
              .replace('image-', 'https://cdn.sanity.io/images/8hlyq26i/production/')
              .replace('-webp', '.webp')

            return {
              price_data: {
                currency: 'usd',
                product_data: {
                  name: item.name,
                  images: [newImage],
                },
                unit_amount: item.price * 100,
              },
              adjustable_quantity: {
                enabled: true,
                minimum: 1,
              },
              quantity: item.quantity,
            }
          }),
          success_url: `${req.headers.origin}/success?session_id={CHECKOUT_SESSION_ID}`, // Use success_url for the redirect after successful payment
          cancel_url: `${req.headers.origin}/canceled`, // Add a cancel_url for when the user cancels the checkout
        }

        const session = await stripe.checkout.sessions.create(params)

        // Return sessionId to the frontend
        res.status(200).json({ sessionId: session.id, clientSecret: session.client_secret })
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
