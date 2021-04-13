const {firebase} = require('../firebase');
const db = firebase.firestore();
const sess = db.collection('sessions');


exports.getSession = (req, res) => {
    sess.doc(req.params.sid)
        .get()
        .then(doc => {
            return res.status(200).send(doc.data());
        })
        .catch(error => {
            console.log('Error obteniendo el session document', error);
            return res.status(404).send(error);
        })
}

exports.newSession = (req, res) => {
    //console.log(req.body.sessiondata)
    sess.add(req.body.sessiondata)
        .then( doc => {
            
            /* 
            ! no es necesario ya utilizar este codigo
            ! se comenta por si sirve luego
            // actualizar el id del documento
            sess
                .doc(doc.id)
                .update({id: doc.id})
                .then(() => {
                    console.log('Campo session.id actualizado exitosamente!');
                })
                .catch(error => {
                    console.log('Error actualizando el campo session.id', error);
                    return res.status(404).send(error);
                })
            */
            return res.status(201).send({id: doc.id});

            // * añade la cita al paciente
            // const userref = users.doc(req.body.sessiondata.patient)
            // userref
            //     .get()
            //     .then( usdoc => {
            //         const sessdata = usdoc.data().sessions;
            //         sessdata.push(doc.id);
            //         userref.update({sessions: sessdata}).then(() => {
            //             console.log('Campo user.sessions actualizado correctamente')
            //         })
            //         .catch(error => {
            //             console.log('Error actualizando el campo user.sessions', error);
            //             return res.status(404).send(error);
            //         })
            //     })
            //     .then(() => {
            //         // * añade la cita al terapeuta 
            //         const terref = ther.doc(req.body.sessiondata.therapist)
            //         terref.get()
            //             .then( terdoc => {
            //                 const data = terdoc.data().sessions;
            //                 data.push(doc.id);
            //                 userref.update({sessions: data})
            //                     .then(() => {
            //                         console.log('Campo user.sessions actualizado correctamente')
            //                         
            //                     })
            //                 .catch(error => {
            //                     console.log('Error actualizando el campo therapist.sessions', error);
            //                     return res.status(404).send(error);
            //                 })
            //             })
            //             .catch(error => {
            //                 console.log('Error obteniendo los datos del terapeuta', error);
            //                 return res.status(404).send(error);
            //             })  
            //     })
            //     .catch(error => {
            //         console.log('Error obteniendo los datos del usuario', error);
            //         return res.status(404).send(error);
            //     })
        })
        .catch(error => {
            console.log("Unable to create new blog", error);
            return res.status(404).send(error);
        })
}

exports.updateSession = (req, res) => {
    sess
        .doc(req.params.sid)
        .update(req.body.sessiondata)
        .then(() => {
            console.log('Sesion actualizada con exito!');
            return res.status(204);
        })
        .catch(error => {
            console.log('Error actualizando el session document', error);
            return res.status(404).send(error);
        })
}

exports.deleteSession = (req, res) => {
    sess
        .doc(req.params.sid)
        .delete()
        .then(() => {
            console.log('Sesion cancelada con exito!');
            return res.status(204);
        }) 
        .catch(() => {
            console.error('Error borrando el documento de sesion', error);
            return res.status(404).send(error);
        })    
}
