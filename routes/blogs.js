const { firebase, storage } = require('../firebase');
var db = firebase.firestore();
const blogs = db.collection('blogs');

exports.getAllBlogs = (req, res) => {
    blogs
        .orderBy('date', 'desc')
        .get()
        .then(query => {
            var data = [];
            var refs = [];
            query.forEach(doc => {
                data.push(doc.data());
                refs.push(doc.id.toString());
            })
            return res.status(200).send({ id: refs, data: data });
        })
        .catch(error => {
            console.log('Error obteniendo todos los blog documents', error);
            return res.status(404).send(error);
        })
}


exports.getAllBlogsByTherapist = (req, res) => {
    blogs
        .where('author', '==', req.params.tid)
        // .orderBy('date', 'desc')
        .get()
        .then(query => {
            var data = [];
            var refs = [];
            query.forEach(doc => {
                data.push(doc.data());
                refs.push(doc.id.toString());
            })
            return res.status(200).send({ id: refs, data: data });
        })
        .catch(error => {
            console.log('Error obteniendo los blog documents del terapeuta', error);
            return res.status(404).send(error);
        })

}

exports.getBlog = (req, res) => {
    blogs
        .doc(req.params.bid)
        .get()
        .then(doc => {
            return res.status(200).send(doc.data());
        })
        .catch(error => {
            console.log('Error obteniendo el blog document', error);
            return res.status(404).send(error);
        })
}

exports.newBlog = (req, res) => {
    blogs
        .add(req.body.blogdata)
        .then(blogdoc => {
            var bucket = storage.bucket("iknelia-3cd8e.appspot.com");
            var stored_img = bucket.file(`usuarios/${req.params.tid}.png`)

            req.body.blogdata.imgBLOG
            /*
            // actualizar campo de id
             ! no sirve por lo pronto,
             TODO: Arreglar el upload de la foto
            blogdoc
                .update({
                    id: blogdoc.id
                })
                .then(() => {
                    console.log('Campo ID: actualizado!\nCampo IMG: actualizado!')
                })
                .catch(error => {
                    console.log('Error actualizando blog document', error);
                    return res.status(404).send(error);
                }) 

            */
        })
        .catch(error => {
            console.log('Error creando el blog document', error);
            return res.status(404).send(error);
        })
}

exports.deleteBlog = (req, res) => {
    blogs
        .doc(req.params.bid)
        .delete()
        .then(() => {
            console.log('Se borro el blog document exitosamente!');
            return res.status(204);
        })
        .catch(error => {
            console.log('Error borrando el blog document', error);
            return res.status(404).send(error);
        })
}

exports.updateBlog = (req, res) => {
    blogs
        .doc(req.params.bid)
        .update(req.body.blogdata)
        .then(() => {
            console.log('Acutalización del blog document exitosa!');
            return res.status(201).send({message: "Blog editado correctamente", bid: req.params.bid});
        })
        .catch(error => {
            return res.status(404).send(error);
        })
}
