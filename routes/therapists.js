const { firebase, storage } = require('../firebase');
var db = firebase.firestore();
const users = db.collection('users');
const ther = db.collection('therapists');
const sess = db.collection('sessions');
const schedules = db.collection("schedules");
const stripe = require('stripe')("sk_test_51IRM5vEkM6QFZKw2N9Ow9xCKwSd2b8J3JjWb2BL9kH5FVCXvJ5fSmFW6GvJot90XsUdgSfbtpPraG5u9Kmycvi5C00HIcjkWgG");

// * Get therapist info
exports.getAllTherapists = async (req, res) => {
    var data = [];
    var refs = [];
    var links = [];
    var bucket = storage.bucket("iknelia-3cd8e.appspot.com");
    ther.get()
        .then((query) => {
            query.docs.forEach( doc => {
                docdata = doc.data();
                data.push(docdata);
                refs.push(doc.id.toString());
            })
            data.forEach(doc => {
                let imgref = doc.img;
                var stor_file = bucket.file(imgref !== undefined ? imgref : 'terapeutas/placeholders/2.jpg');
                stor_file.getSignedUrl({
                    version: 'v4',
                    action: 'read',
                    expires: Date.now() + 30 * 60 * 1000, // 30 minutes   
                }).then(sURL => {
                    console.log(sURL[0][0]);
                    links.push(sURL[0]);
                })
            })
            console.log("Links cargados")
        })
        .catch( error => {
            console.log('Error al obtener terapeutas!', error);
            return res.status(404).send(error)
        })
        .finally(() => { 
            setTimeout(() => {
                res.status(200).send({ id: refs, data: data, urls: links })
            }, 100) 
        })
        
}

exports.getPatientsbyTherapist = (req,res) => {
    var bucket = storage.bucket("iknelia-3cd8e.appspot.com");
    users
        .where("therapist", "==", req.params.tid)
        .get()
        .then(query => {
            var data = [];
            var refs = [];
            var urls = [];
            query.forEach(doc => {
                let docdata = doc.data()
                data.push(docdata);
                refs.push(doc.id.toString());
                var stor_file = bucket.file(docdata.img ? docdata.img : "usuarios/placeholders/none-user.png")
                stor_file.getSignedUrl({
                    version: 'v4',
                    action: 'read',
                    expires: Date.now() + 30 * 60 * 1000, // 30 minutes   
                }).then(sURL => {
                    urls.push(sURL[0]);
                })
                .catch( er => {
                    console.log("Error leyendo el link de la imagen");
                    return res.status(400).send(er);
                })
                
            })

            res.status(200).send({ id: refs, data: data, url: urls })
            //setTimeout(20, () => res.status(200).send({ id: refs, data: data, url: urls }))
        })
        .catch(error => {
            console.log('No fue posible obtener la información de usuarios asignados')
            return res.status(404).send(error)
        })
}

exports.getPatientsImageByTherapist = (req,res) => {
    users
        .where("therapist", "==", req.params.tid)
        .get()
        .then(query => {
            var data = [];
            var refs = [];
            query.forEach(doc => {
                data.push(doc.data());
                refs.push(doc.id.toString());
            })

            return res.status(200).send({ id: refs, data: data })
        })
        .catch(error => {
            console.log('No fue posible obtener la información de usuarios asignados')
            return res.status(404).send(error)
        })
}

exports.getTherapist = (req, res) => {
    ther
        .doc(req.params.tid)
        .get()
        .then((doc) => {
            return res.status(200).send(doc.data())
        })
        .catch(error => {
            console.log('Error al obtener terapeuta!', error);
            return res.status(404).send(error)
        })
}

exports.getSchedule = (req, res) => {
    schedules.doc(req.params.tid).get()
    .then( doc => {
        return res.status(200).send({...doc.data()})
    })
    .catch( er => {
        return res.status(400).send(er)
    })
}

exports.setSchedule = (req, res) => {
    schedules.doc(req.params.tid)
    .set({ schedule: req.body.schedule, options: req.body.options })
    .then(() =>{
        return res.status(201).send({ 
            result: true, 
            message: "Schedule actualizada correctamente" 
        })
    })
    .catch(er => {
        return res.status(400).send(er);
    })
}

exports.getAllSessionsByTherapist = (req, res) => {
    sess
        .where('therapist', '==', req.params.tid)
        .get()
        .then((query) => {
            const data = [];
            const refs = [];
            query.forEach((doc) => {
                data.push(doc.data());
                refs.push(doc.id);
            })
            return res.status(200).send({ id: refs, data: data })
        })
        .catch(error => {
            console.log('Error al obtener sesiones terapeuta!', error);
            return res.status(404).send(error)
        })
}


// * Obtener notas del terapeuta
exports.getNotesByTherapist = (req, res) => {
    console.log("obteniendo notas")
    ther.doc(req.params.tid)
        .get()
        .then(doc => {
            const notes_ref = doc.ref.collection("notes");
            notes_ref
                .get()
                .then(query => {
                    const data = [];
                    const refs = [];

                    query.forEach(doc => {
                        data.push(doc.data());
                        refs.push(doc.id.toString());
                    })

                    return res.status(200).send({ id: refs, data: data })
                })
                .catch(error => {
                    console.error("Error obteniendo las notas del terapeuta", error);
                    return res.status(404).send(error);
                })
        })
        .catch(error => {
            console.error("Error obteniendo los datos del terapeuta", error);
            return res.status(404).send(error);
        })
}

//** Crear una nueva nota */
exports.newNote = (req,res) => {
    console.log('Creando nota')
}

exports.connectReAuth = (req,res) => {
    const {email} = req.body;
    const account = stripe.accounts.retrieve({
        type:'express',
        email: email,
        capabilities: {
            card_payments: {requested:true},
            transfers: {requested:true}
        }
    })
    .catch(e => {
        console.error('No ha sido posible autenticarte')
        console.error(e)
    })
}

exports.handleAccountUpdate = (req, res) => {
    const hosts = [
        'http://localhost:9999/iknelia-3cd8e/us-central1/api', // * local emulator dev host
        'https://us-central1-iknelia-3cd8e.cloudfunctions.net/api' // * cloud api host
      ]
    // const webhookAccountUpdate = await stripe.webhookEndpoints.create({
    //   url: `${hosts[1]}/t/${req.params.tid}/webhookUpdateAccount`,
    //   enabled_events: [
    //     'account_updated'
    //   ],
    // })

    const sig = req.headers['stripe-signature']; // @Signature de la API de Stripe

    //0-testCLI 1-stripe-test 2-stripe live mode @Secreto del endpoint webhook
    const endpoint_secret = ["whsec_OMF9oQSkPJsmHdMFJlTsWYe8pgLahNBd","whsec_ZBv8dScsRtH1S36P3AllVEhr3vA1HnJf", "whsec_fwfyWE5QTrOkBJZ7mEfU3LxgsOwhkpvy"][1]; 
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
        case 'account_update':
            console.log('Se recibió el evento',event)
        default:
            console.log('Unhandled type event')
    }

    return res.status(200).send({event, message:'Se recibió el evento'})
}

exports.uploadTherImg = (req, res) => {
    console.log(`Subiendo imagen del usuario ${req.params.uid}`)
    console.log(req.body.file)
    if (!req.files || Object.keys(req.files).length === 0) {
        console.log("No hay archivos :C")
        return res.status(400).send({
            success: false,
            message: 'No files were uploaded',
        });
    }
    
    var bucket = storage.bucket("iknelia-3cd8e.appspot.com");
    var stored_img = bucket.file(`usuarios/${req.params.uid}.${req.file.name.split(".")[1]}`)
    
    const blobStream = stored_img.createWriteStream()

    blobStream.on('error', (error) => {
        console.log('Something is wrong! Unable to upload at the moment.' + error);
    });

    blobStream.on('finish', () => {
        var imgURL = `https://storage.googleapis.com/${bucket.name}/${stored_img.name}`; //image url from firebase server
        console.log(imgURL);
        auth.updateUser(user.uid, {
            photoURL: imgURL,
        })
        .then(() => {
            return res.status(200).send({
                success: true,
                message: 'File was uploaded',
                imgURL: imgURL,
            });
            
        })
        .catch( er => {
            return res.status(400).send(er);
        })
    });

    blobStream.end(req.file.buffer);
}



exports.getAllTherImage = (req, res) => { // * Demo for image upload
    let t_list = req.body.thers;
    console.log(t_list)
    let urls = [];
    var bucket = storage.bucket("iknelia-3cd8e.appspot.com");
    for (let t of t_list) {
        ther.doc(t).get()
        .then(doc => {
            let imgref = doc.data().img;
            var stor_file = bucket.file(imgref !== undefined ? imgref : 'terapeutas/placeholders/2.jpg');
            stor_file.getSignedUrl({
                version: 'v4',
                action: 'read',
                expires: Date.now() + 30 * 60 * 1000, // 30 minutes   
            }).then(sURL => {
               urls.push(sURL[0]);
            })
            .catch( er => {
                console.log("Error leyendo el link de la imagen");
                return res.status(400).send(er);
            })
        })
        .catch(er => {
            console.log("Error leyendo el documento del terapeuta");
            return res.status(400).send(er);
        })
    }
    return res.status(200).send({ urls: urls });

}

exports.getTherImage = (req, res) => { // * Demo for image upload
    
    var bucket = storage.bucket("iknelia-3cd8e.appspot.com");
    ther.doc(req.params.tid).get()
    .then(doc => {
        let imgref = doc.data().img;
        var stor_file = bucket.file(imgref !== undefined ? imgref : 'terapeutas/placeholders/2.jpg');
        stor_file.getSignedUrl({
            version: 'v4',
            action: 'read',
            expires: Date.now() + 30 * 60 * 1000, // 30 minutes   
        }).then(sURL => {
            return res.status(200).send({ url: sURL[0]});
        })
        .catch( er => {
            console.log("Error leyendo el link de la imagen");
            return res.status(400).send(er);
        })
    })
    .catch(er => {
        console.log("Error leyendo el documento del terapeuta");
        return res.status(400).send(er);
    })


}
