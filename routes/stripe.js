const stripe = require('stripe')("");

/**La private key será utilizada con una variable de entorno */

exports.sendPaymentInfo = (req, res) => {
    // TODO: Sacar el payment ID y ponerlo en el usuario 
    const { amount, email, payment_method_id } = req.body
    stripe.paymentIntents.create({
        "amount": amount,
        "currency": 'mxn',
        "description": 'Sesión individual',
        "payment_method": payment_method_id,  
        "payment_method_types": ['card', 'oxxo'],
        "receipt_email": email,
    })
    .then((paymentIntent) => {
        console.log(paymentIntent.receipt_email, "Ticket de pago generado exitosamente api")
        return res.status(200).send({
            "client_secret": paymentIntent.client_secret, 
            "message": 'Ticket de pago generato exitosamente'
        })
    })
    .catch((error) => {
        console.log('Error al procesar tu pago',error.message)
        res.status(400).send(error)
    })
} 

exports.handleStripeEvent = (req, res) => { // * Código que maneja el otso
    const sig = req.headers['stripe-signature']; // @Signature de la API de Stripe

    //0-testCLI 1-stripe-test 2-stripe live mode @Secreto del endpoint webhook
    const endpoint_secret = ["whsec_OMF9oQSkPJsmHdMFJlTsWYe8pgLahNBd","whsec_CObnwxUSvfRajVBO08viht8UpZNRXWhI", "whsec_fwfyWE5QTrOkBJZ7mEfU3LxgsOwhkpvy"][1]; 
    let event = req.body; // @ Lee la información enviada


    try { 
        /* 
          * Se construye unevento a traves de stripe pasando como argumentos:
            @ Signature de stripe
            @ secreto del endpoint
            @ Informacion obtenida del POST
        */
        event = stripe.webhooks.constructEvent(req.body, sig, endpoint_secret);
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    console.log(event)

    switch(event.type) {
        case 'payment_intent.succeeded':
            console.log("Pago recibido con " + event["payment_method_types"])
            
            // * Se hizo el pago del voucher del OXXO exitosamente 
            break;
            
        case 'payment_intent.requires_action':
            
            // * Se genero el voucher del OXXO
            console.log("Voucher generado")
            // - 1 Crear sesion en firestore con valor
            // - 

        case 'payment_intent.processing':
            // * Se esta procesando el outcome del pago
            console.log("Voucher en proceso")
            break;

        case 'payment_intent.payment_failed':
            // * No se hizo el pago exitosamente :C
            console.log("Pago no realizado")
            break;
                    
        
        // ... handle other event types
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    return res.status(200).send({received: true});
}

exports.expressAccount = (req, res) => {
    const { email } = req.body;

    const account = stripe.accounts.create({
        type:'express',
        email: email,
        country: 'MX',
        business_type: 'individual'
    })
    .then(response => {
        /**
         * TODO MOVER TEST DATA
         */
        const hosts = [
            'http://localhost:9999/iknelia-3cd8e/us-central1/api', // * local emulator dev host
            'https://iknelia.app' // * cloud api host
          ]
        stripe.accountLinks.create({
            account: response.id,
            refresh_url: `${hosts[1]}/${req.params.tid}/reAuth`,
            return_url: `${hosts[1]}/${req.params.tid}/dashboard`,
            type:"account_onboarding"
        }).then(response1 => {
            console.log("Enviando link")
    
            return res.status(200).send(response1)
        })
    })
    .catch(e => {
        console.error('No ha sido posible crear tu cuenta')
        console.error(e)
    })
}

// exports.reAuth = (req,res) => {
//     const {email} = req.body

//     const account = stripe.accounts.create({
//         type:'express',
//         email: email,
//         capabilities: {
//             card_payments: {requested:true},
//             transfers: {requested:true}
//         }
//     })

// }
