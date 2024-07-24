const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

export default async function handler(req, res) {
  switch (req.method) {
    case 'POST':
      console.log(req.body)
      try {
        const params = {
          submit_type: 'pay',
          mode: 'payment',
          payment_method_types: ['card'],
          billing_address_collection: 'auto',
          shipping_options: [
            {shipping_rate: 'shr_1Pfmv8RvOwan2XKgDkOOplpL'},
            {shipping_rate: 'shr_1Pfna0RvOwan2XKgYy0LL7XT'},
          ],
          ui_mode: 'embedded',
          line_items: req.body.map((item)=>{
            const img = item.image[0].asset._ref
            const newImage = img.replace('image-', 'https://cdn.snity.io/images/8hlyq26i/production/').replace('-webp', '.webp')

            return{
              price_data: {
                currency: 'usd',
                product_data: {
                  name: item.name,
                  images: [newImage],
                },
                unit_amount: item.price * 100 
              },
              adjustable_quantity: {
                enabled: true,
                minimum: 1
              },
              quantity: item.quantity
            }
          }),
          return_url: `${req.headers.origin}/return?session_id={CHECKOUT_SESSION_ID}`,
        }
        const session = await stripe.checkout.sessions.create(params)
        res.status(200).json(session)
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
