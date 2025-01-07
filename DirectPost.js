const https = require('https')
const querystring = require('querystring')

class DirectPost {
	constructor(security_key) {
		this.security_key = security_key
	}

	setBilling(billingInformation) {
		// Validate that passed in information contains valid keys
		const validBillingKeys = ['first_name', 'last_name', 'company', 'address1',
			'address2', 'city', 'state', 'zip', 'country', 'phone', 'fax', 'email']

		for (let key in billingInformation) {
			if (!validBillingKeys.includes(key)) {
				throw new Error(`Invalid key provided in billingInformation. '${key}'
            is not a valid billing parameter.`)
			}
		};

		this.billing = billingInformation
	}

	setShipping(shippingInformation) {
		// Validate that passed in information contains valid keys
		const validShippingKeys = [
			'shipping_first_name', 'shipping_last_name', 'shipping_company',
			'shipping_address1', 'address2', 'shipping_city', 'shipping_state',
			'shipping_zip', 'shipping_country', 'shipping_email'
		]

		for (let key in shippingInformation) {
			if (!validShippingKeys.includes(key)) {
				throw new Error(`Invalid key provided in shippingInformation. '${key}'
            is not a valid shipping parameter.`)
			}
		};

		this.shipping = shippingInformation
	}

	async doSale(amount, ccNum, ccExp, cvv) {
		let requestOptions = {
			'type': 'sale',
			'amount': amount,
			'ccnumber': ccNum,
			'ccexp': ccExp,
			'cvv': cvv
		}

		// Merge together all request options into one object
		Object.assign(requestOptions, this.billing, this.shipping)

		// Make request
		const result = await this._doRequest(requestOptions)
		return result
	}


	async addSubscription(planPayments, planAmount, dayFrequency, ccnumber, ccexp, cvv) {
		let requestOptions = {
			recurring: 'add_subscription',
			plan_payments: planPayments, // Notes: '0' for until canceled
			plan_amount: planAmount, // Format: x.xx
			day_frequency: dayFrequency, // How often, in days, to charge the customer.
			ccnumber: ccnumber,
			ccexp: ccexp,
			cvv: cvv
		}

		Object.assign(requestOptions, this.billing, this.shipping)

		// // Include billing and shipping information if available
		// if (this.billing) Object.assign(requestOptions, this.billing)
		// if (this.shipping) Object.assign(requestOptions, this.shipping)

		// Make request
		const result = await this._doRequest(requestOptions)
		return result
	}


	async _doRequest(postData) {
		const hostName = 'seamlesschex.transactiongateway.com'
		const path = '/api/transact.php'

		postData.security_key = this.security_key
		postData = querystring.stringify(postData)

		const options = {
			hostname: hostName,
			path: path,
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'Content-Length': Buffer.byteLength(postData)
			}
		}

		return new Promise((resolve, reject) => {
			const req = https.request(options, (response) => {
				console.log(`STATUS: ${response.statusCode}`)
				console.log(`HEADERS: ${JSON.stringify(response.headers)}`)

				let responseBody = ''

				response.on('data', (chunk) => {
					responseBody += chunk
				})

				response.on('end', () => {
					console.log('No more data in response.')
					resolve(responseBody)  // Resolve the promise with the full response body
				})
			})

			req.on('error', (e) => {
				console.error(`Problem with request: ${e.message}`)
				reject(e)  // Reject the promise if there's an error
			})

			// Write post data to request body
			req.write(postData)
			req.end()
		})
	}
}

module.exports = DirectPost
