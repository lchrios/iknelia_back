const { firebase, storage } = require('../firebase');
var db = firebase.firestore();
var users = db.collection('users');
var ther = db.collection('therapists');
var sess = db.collection('sessions');
var tests = db.collection("tests");
var schedules = db.collection("schedules");

exports.getAllUsers = function (req, res) {
    users
        .get()
        .then( query => {
            var data = [];
            var refs = [];
            query.forEach( doc => {
                data.push(doc.data());
                refs.push(doc.id.toString());
            })
            
            console.log('Datos de usuarios obtenidos correctamente!');
            return res.status(200).send({ id: refs, data: data });
        })
        .catch( error => {
            console.error('Error obteniendo los usuarios', error);
            return res.status(404).send(error);
        })
}

exports.getUser = (req, res) => {
    users
        .doc(req.params.uid)
        .get()
        .then( doc => {
            console.log('Datos de usuario obtenidos correctamente!');
            return res.status(200).send(doc.data());
        })
        .catch( error => {
            console.error('Error obteniendo los datos de usuario', error);
            return res.status(404).send(error);
        })
}

exports.getTherapistByUser = (req, res) => {
    users
        .doc(req.params.uid)
        .get()
        .then( doc => {
            const data = doc.data()
            console.log(data.therapist)
            if (data.therapist === undefined || data.therapist === "") {
                console.log("No hay terapeuta");
                return res.status(204).send({});
            } else {
                ther
                .doc(data.therapist)
                .get()
                .then( docther => {
                    console.log('Datos de terapeuta obtenidos correctamente!');
                    return res.status(200).send({ id: docther.id, data: docther.data() })
                })
                .catch( error => {
                     console.error('Error obteniendo los datos del terapeuta', error);
                     return res.status(404).send(error);
                })
            }
            
        })
}

exports.getTherapistSchedule = (req, res) => {
    users.doc(req.params.uid).get()
    .then( doc => {
        schedules.doc(doc.data().therapist).get()
        .then( docSched => {
            if (docSched.exists) {
                var data = docSched.data();
                return res.status(200).send({schedule: data.schedule !== undefined ? data.schedule : undefined, options: data.options})
            } else {
                return res.status(204).send({});
            }
        })
        .catch( er => {
            return res.status(400).send(er)
        })
    })
    .catch( er => {
        return res.status(400).send(er)
    })
}

exports.getAllSessionsByUser = (req, res) => {
    sess
        .where('user', '==', req.params.uid)
        //.orderBy("date", "desc")
        .get()
        .then( query => {
            const data = [];
            const refs = []
            query.forEach((doc) => {
                data.push(doc.data());
                refs.push(doc.id.toString());
            })

            console.log('Datos de sesiones obtenidos correctamente!');
            return res.status(200).send({ id: refs, data: data });
        })
        .catch( error => {
            console.error('Error obteniendo los datos de sesiones', error);
            return res.status(404).send(error);
        })
}

exports.assignTherapist = (req, res) => {
    console.log(`Reasignando terapeuta ${req.params.tid}`)
    users
        .doc(req.params.uid)
        .update({ therapist: req.params.tid })
        .then(() => {
            console.log('Terapeuta asignado correctamente');
            return res.status(201).send();
        })
        .catch( error => {
            console.error('Error actualizando el terapeuta del usuario', error);
            return res.status(404).send(error);
        })      
}


exports.newTestAnswers = (req, res) => {
    tests.add(req.body.answers)
        .then( doc => {
            console.log("Nueva entrada de respuestas creada correctamente!");
            return res.status(203).send(doc.id);
        })
        .catch( error => {
            console.log("Error creando el registro de respuesta!");
            console.error(error);
            return res.status(404).send(error);
        })
}

exports.uploadImg = (req, res) => {
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

exports.getUserImage = (req, res) => { // * Demo for image uploa
    var bucket = storage.bucket("iknelia-3cd8e.appspot.com");

    users.doc(req.params.uid).get()
    .then(doc => {
        let data = doc.data()
        var stor_file = bucket.file(data.img);
        stor_file.getSignedUrl({
            version: 'v4',
            action: 'read',
            expires: Date.now() + 30 * 60 * 1000, // 15 minutes
            
        }).then(sURL => {
            return res.status(200).send({ url: sURL[0] });
        })
        .catch( er => {
            return res.status(404).send(er);
        })
    })
}

exports.submitTest = (req, res) => {
    // Validar que el usuario no haya contestado antes
    tests.doc(req.params.uid).set(req.body.testdata)
    .then(doc => {
        users.doc(req.params.uid).update({"answered": true})
        .then(() => {
            return res.status(201).send({message: "Respuestas registradas", id: doc.id})
        })
        .catch( er => {
            return res.status(400).send(er);
        })
    })
    .catch( er => {
        return res.status(400).send(er);
    })
}

exports.getUserPayed = (req, res) => {
    sess
        .where("payed", "==", false)
        .where("user", "==", req.params.uid)
        .get()
    .then(query => {
        return res.status(200).send({ payed: query.empty })
    })
    .catch(er => {
        return res.status(500).send(er);
    })
}

exports.getAllUserImage = (req, res) => { // * Demo for image upload
    var u_list = req.body.users;
    var url = [];
    var ers = [];
    var bucket = storage.bucket("iknelia-3cd8e.appspot.com");
    for (let u of u_list) {
        users.doc(u).get()
        .then(doc => {
            let data = doc.data()
            let imgref = data.img;
            var stor_file = bucket.file(imgref !== undefined ? imgref : 'usuarios/placeholders/face-1.png');
            stor_file.getSignedUrl({
                version: 'v4',
                action: 'read',
                expires: Date.now() + 30 * 60 * 1000, // 30 minutes   
            }).then(sURL => {
                console.log(sURL[0])
                url.push(sURL[0])
            })
            .catch( er => {
                ers.push(er);
            })
        })
        .catch(er => {
            console.log("Error leyendo el documento del usuario");
            return res.status(400).send(er);
        })
    }

    setTimeout(() => {
        res.status(200).send({ result: true, urls: url })
    }, 20)

}