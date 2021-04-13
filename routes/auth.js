const { decode } = require('firebase-functions/lib/providers/https');
const { firebase, storage } = require('../firebase');
const db = firebase.firestore();
const auth = firebase.auth();
var users = db.collection('users');
var thers = db.collection('therapists');

exports.isAuthorized = (hasRole) => {
    return (req, res, next) => {

        const { role, uid } = res.locals;
        
        if (!role) { // * no tiene rol el usuario
            return res.status(403).send({ status: 'Unauthorized', message: "El usuario no tiene rol" });
        } else if (hasRole.indexOf(role) > -1) { // * revisa que el rol del usuario contenga los permitidos 
            //console.log("Usuario autorizado")
            return next();
        }

        return res.status(403).send({ status: 'Unauthorized', message: "El usuario no tiene rol" });
    }
}

exports.isAuthenticated = (req, res, next) => {
    //console.log('Verificando usuario autenticado');
    /* 
     * Verifica que el request contenga un ID Token.
     - Por convención el authorization header al portar 
     - un string 'Bearer ' justo antes del tokenId.
    */
    if (!(req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) &&
    !(req.cookies && req.cookies.__session)) {
            console.error('Ningun Firebase ID token fue pasado como Bearer token en el Authorization header.',
            'Asegurate que autorizas tu request proveyendo el siguiente HTTP header:',
            'Authorization: Bearer <Firebase ID Token>',
            'o pasando una "__session" cookie.');
            return res.status(403).send('Unauthorized');
    }

    let idToken;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        // * En este caso se encuentra exitosamente un formato de string que comience con 'Bearer '.
        //console.log('Encontrado "Authorization" header');
        // * Lee el ID Token del authorization header.
        idToken = req.headers.authorization.split('Bearer ')[1];
    } else if (req.cookies) {
        // * Si no encuentra el authorization header procede a revisar si el reques cuenta con cookies de sesión.
        console.log('Encontrado "__session" cookie');
        // * Lee el ID Token de la cookie.
        idToken = req.cookies.__session;
    } else {
        // * No se encontró ni un authorization header válido o alguna cookie. 
        return res.status(403).send('Unauthorized');
    }

    // * Una vez obtenido el ID Token, procedemos a verificar que sea correcto mediante firebase auth
    auth.verifyIdToken(idToken)
    .then( decodedIdToken => { // * Obtenemos el decodedIDToken como resultado de una operación exitosa
        //console.log('ID Token verificado!');
        auth.getUser(decodedIdToken.uid).then(user => {
            // * Assign user role in case it doesnt have
            if (user.customClaims.role === undefined) {
                console.log("Usuario sin rol asignado :C\nAsignando rol")
                auth.setCustomUserClaims(user.uid, { role: "user" })
                .then(() => {
                    console.log('Usuario registrado con rol "user" correctamente!');
                    res.locals = { ...res.locals, uid: decodedIdToken.uid, role: "user" }
                })
                .catch( error => {
                    console.error('Error asignando el rol de "user" al usuario', error)
                    return res.status(400).send(error);
                })
            } else {
                //console.log("Usuario con rol")
                res.locals = { ...res.locals, uid: decodedIdToken.uid, role: user.customClaims.role }
            }
            next();
            return;
        })
    })
    .catch( error => {
        console.error('Error al verififcar el Firebase ID token:', error);
        res.status(403).send('Unauthorized');
        return;
    });
}

exports.setfirebase = (req, res) => {
    auth
        .setCustomUserClaims(req.params.uid, { role: "firebase" } )
        .then(() => {
            console.log('Usuario hecho firebase exitosamente');
            return res.status(201);
        })
        .catch( error => {
            console.error('Error cambiando el rol del usuario', error);
            return res.status(404).send(error);
        })
}

exports.setTherapist = (req, res) => {
    auth
        .setCustomUserClaims(req.params.uid, { role: "therapist" } )
        .then(() => {
            console.log('Usuario hecho therapist exitosamente');
            return res.status(201);
        })
        .catch( error => {
            console.error('Error cambiando el rol del usuario', error);
            return res.status(404).send(error);
        })
}

exports.setUser = (req, res) => {
    auth
        .setCustomUserClaims(req.params.uid, { role: "user" } )
        .then(() => {
            console.log('Usuario hecho user exitosamente');
            return res.status(201).send({ user: req.params.uid, role: "user"});
        })
        .catch( error => {
            console.error('Error cambiando el rol del usuario', error);
            return res.status(404).send(error);
        })
}

exports.createUserWithEmailAndPassword = (req, res) => {
    auth
        .createUser({
            email: req.body.email,
            emailVerified: false,
            password: req.body.password,
            displayName: req.body.userdata.name,
            photoURL: "https://storage.googleapis.com/iknelia-3cd8e.appspot.com/usuarios/placeholders/none-user.png",
            disabled: false,
        })
        .then( user => {
            console.log('Auth: Usuario creado exitosamene!');

            const actionCodeSettings = {
                // URL you want to redirect back to. The domain (www.example.com) for
                // this URL must be whitelisted in the Firebase Console.
                url: 'https://www.iknelia.app/home',
                // This must be true for email link sign-in.
                handleCodeInApp: true,
                iOS: {
                  bundleId: 'com.example.ios',
                },
                android: {
                  packageName: 'com.example.android',
                  installApp: true,
                  minimumVersion: '12',
                },
                // FDL custom domain.
                dynamicLinkDomain: 'www.iknelia.app',
            };
            auth.generateEmailVerificationLink(user.email, actionCodeSettings)
            .then(link => {
                return sendCustomVerificationEmail(user.email, user.displayName, link);
            })
            .catch((err) => {
                console.error("Error:", err);
            });

            // * Sube el usuario creado a colleccion de usuarios
            users
                .doc(user.uid)
                .set(req.body.userdata)
                .then(() => {
                    console.log('Collection: Users - Listo!', user.uid);
                    // * Actualizar el rol del usuario a 'user'
                })
                .then(() => {
                    auth.setCustomUserClaims(user.uid, { role: "user" })
                    .then(() => {
                        console.log('Usuario registrado con rol "user" correctamente!');
                        return res.status(201).send(user);
                    })
                    .catch( error => {
                        console.error('Error asignando el rol de "user" al usuario', error)
                        return res.status(404).send(error);
                    })
                })
                .catch( error => {
                    console.error('Error registrando el usuario en collection "users"', error);
                    return res.status(400).send(error);
                })
        })
        .catch(error => {
            console.log('Error creando usuario!', error);
            return res.status(500).send(error)
        });
}

exports.updateTherapistInfo = (req, res) => {
    thers.doc(req.params.tid).set(req.body.therapistdata)
    .then(() => {
        console.log('Collection: Therapist- Listo!');
        // * Actualizar el rol del usuario a 'user'
        auth
            .setCustomUserClaims(user.uid, { role: "therapist" })
            .then(() => {
                console.log('Usuario registrado con rol "therapist" correctamente!');
                return res.status(201).send(user);
            })
            .catch( error => {
                console.error('Error asignando el rol de "therapist" al usuario', eror)
                return res.status(404).send(error);
            })
    })
    .catch( error => {
        console.error('Error registrando el usuario en collection "therapists"', error);
        return res.status(404).send(error);
    })
}

exports.getFilesAndInfo = (req, res ) => {
    // * Validates that the request contains a file
    // return res.status(200).send({ files: req.files["CVs"] })
    // if (!req.files || Object.keys(req.files).length === 0) {
    //     return res.status(400).send({
    //         "message": 'No files were uploaded.',
    //         "success": false,
    //         "body": req.body,
    //     });
    // }

    if (!req.body) {
        return res.status(400).send({
            "message": 'No files were uploaded.',
            "success": false,
        });
    }

    return res.status(200).send({
        data: req.body.toString(),
    });
}

exports.createTherapistWithEmailAndPassword = (req, res) => {
    auth
        .createUser({
            email: req.body.email,
            emailVerified: false,
            password: req.body.password,
            displayName: req.body.therapistdata.name,
            photoURL: "https://storage.googleapis.com/iknelia-3cd8e.appspot.com/usuarios/placeholders/none-user.png",
            disabled: false,
        })
        .then(user => {
            // subir a colleccion de usuarios
            thers
                .doc(user.uid)
                .set(req.body.therapistdata)
                .then(() => {
                    console.log('Collection: Therapist- Listo!');
                    // * Actualizar el rol del usuario a 'user'
                    auth
                        .setCustomUserClaims(user.uid, { role: "therapist" })
                        .then(() => {
                            console.log('Usuario registrado con rol "therapist" correctamente!');
                            return res.status(201).send(user);
                        })
                        .catch( error => {
                            console.error('Error asignando el rol de "therapist" al usuario', eror)
                            return res.status(404).send(error);
                        })
                })
                .catch( error => {
                    console.error('Error registrando el usuario en collection "therapists"', error);
                    return res.status(404).send(error);
                })
        })
        .catch(error => {
            console.log('Error creando terapeuta!', error);
            return res.status(404).send(error)
        });
}
