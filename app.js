require('dotenv').config()
const express = require('express')
const { engine } = require('express-handlebars')
const DirectPost = require('./DirectPost')

const app = express()

// Set up Handlebars view engine
app.engine('hbs', engine({
	extname: '.hbs', // Set file extension to .hbs
	defaultLayout: 'main'
}))
app.set('view engine', 'hbs')
app.set('views', './views')

app.use(express.json()) // Middleware to parse JSON

// Route to render the index template
app.get('/', (req, res) => {
	res.render('index', {
		token: process.env.data_tokenization_key,
		title: 'Payment Processing Form'
	})
})

app.post('/process-payment', async (req, res) => {
	const dp = new DirectPost(process.env.DirectPost_key)

	const billingInfo = {
		'first_name': 'Test',
		'last_name': 'User',
	}

	const shippingInfo = {
		'shipping_first_name': 'User',
		'shipping_last_name': 'Test',
	}

	dp.setBilling(billingInfo)
	dp.setShipping(shippingInfo)
	// Set dummy data for sale
	const result = await dp.doSale('10.00', '4111111111111111', '1025', '999')

	const resultSubscription = await dp.addSubscription('0', '1.00', '7', '4111111111111111', '1025', '999')

	console.log(`result Subscription ${JSON.stringify(result)}`)

	res.render('index', { title: 'test', message: `${JSON.stringify(result)}`, message2: `${JSON.stringify(resultSubscription)}` })
})

const PORT = 3000
app.listen(PORT, () => {
	console.log(`Server running on http://localhost:${PORT}`)
})
