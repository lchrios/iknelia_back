const { firebase } = require('../firebase');
var db = firebase.firestore();
var notes = db.collection("notes");
const ther = db.collection('therapists');

exports.getAllNotesByTherapist = (req, res) => {
    notes
        .where("author", "==", req.params.tid)
        .get()
        .then( query => {
            var data = [];
            var refs = [];
            query.forEach( doc => {
                data.push(doc.data());
                refs.push(doc.id.toString());
            })
            console.log("Datos de las notas obtenidos correctamente!");
            return res.status(200).send({ id: refs, data: data })
        })
        .catch( error => {
            console.error("Error al obtener las notas del terapeuta", error);
            return res.status(404).send(error);
        })
}

exports.getNote = (req, res) => {
    notes
        .doc(req.params.nid)
        .get()
        .then( doc => {
            console.log("Datos de la nota obtenidos correctamente!");
            return res.status(200).send({ id: doc.id.toString(), data: doc.data() })
        })
        .catch( error => {
            console.error("Error al obtener la nota del terapeuta", error);
            return res.status(404).send(error);
        })
}

exports.newNote = (req, res) => {
    ther.doc(req.params.tid).collection("notes")
        .add(req.body.notedata)
        .then(doc => {
            console.log("Nota creada exitosamente!");
            return res.status(203).send();
        })
        .catch(error => {
            return res.status(404).send(error);
        })
    
    // * metodo 2
    /*
    notes
        .add(req.body.notedata)
        .then( doc => {
            console.log("Nota creada exitosamente");
            author = ther.doc(req.body.blogdata.author);
            author
                .get()
                .then(doc => {
                    mynotes = doc.data().notes;
                    mynotes.push(doc.id);
                    author.update({ notes: mynotes })
                    .then(() => {
                        console.log("Añadida al autor exitosamente!");
                        return res.status(201).send(doc.id);
                    })
                    .catch(error => {
                        console.log('Error actualizando el campo notes en author document', error);
                        return res.status(404).send(error);
                    })
                })
                .catch(error => {
                    console.log('Error obteniendo author document', error);
                    return res.status(404).send(error);
                })
        })
        .catch(error => {
            console.log('Error creando el note document', error);
            return res.status(404).send(error);
        })
    */
}

exports.deleteNote = (req, res) => {
    notes
        .doc(req.params.nid)
        .delete()
        .then(() => {
            console.log('Se borro el note document exitosamente!');
            return res.status(204);
        })
        .catch(error => {
            console.log('Error borrando el note document', error);
            return res.status(404).send(error);
        })
}

exports.updateNote = (req, res) => {
    notes
        .doc(req.params.nid)
        .update(req.body.notedata)
        .then(() => {
            console.log('Acutalización del note document exitosa!');
            return res.status(204);
        })
        .catch(error => {
            return res.status(404).send('Error al actualizar el note document', error);
        })
}