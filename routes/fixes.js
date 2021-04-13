// !!!!!!!! ESTE ARCHIVO SE DEBE ELIMINAR ANTES DEL DEPLOY !!!!!!!!!!!!!!!!!11
const { date } = require('joi');
const Joi = require('joi') 
const { firebase } = require('../firebase');
const db = firebase.firestore();
const users = db.collection("users");
const sessions = db.collection("sessions");
const thers = db.collection("therapists");
const blogs = db.collection("blogs");
     

// * User database schema for validation
 

exports.fixAllUsers = (req, res) => {
    // ? Fields to eliminate
    // *    location

    // ? Fields to add
    // *    address

    users.get()
    .then( query => {
        var ers = [];
        query.forEach( doc => {
            var data = doc.data();
            let fixed_data = {
                address: data.address || "Dirección",
                age: data.age || 18,
                answered: data.answered || false,
                email: data.email || "email@mail.com",
                img: data.img || "usuarios/placeholders/none-user.png",
                lname: data.lname || "Apellido",
                name: data.name || "Nombre",
                payment_met: data.payment_met || [],
                phone: data.phone || "0101010101",
                therapist: data.therapist || "",
                gender: data.gender || "Hombre", 
            }
            doc.ref.set(fixed_data)
            .then(() => {
                console.log(doc.id)
            })
            .catch(er => {
                ers.push(er);
            })
        })
        return ers.length === 0 ? res.status(200).send("Usuarios correctamente corregidos") : res.status(400).send({errors: ers, message: "Errores al actualizar ciertos usuarios"})
    })
}

exports.fixAllTherapists = (req, res) => {
    thers.get()
    .then( query => {
        var ers = [];
        query.forEach( doc => {
            var data = doc.data();
            let fixed_data = {
                address: data.address || "Direccion Terapeuta",
                age: data.age || 18,
                cedula: data.cedula || "CEDULA_ID",
                email: data.email || "correo@generico.com",
                experiencia: data.experiencia || "Experiencia del psicologo",
                gender: data.gender || "Hombre",
                img: data.img || "terapeutas/placeholders/2.jpg",
                name: data.name || "Nombre",
                lname: data.lname || "Apellido",
                zoomurl: data.zoomurl || "https://zoom.us",
                phone: data.phone || "0101010101",
            }
            doc.ref.set(fixed_data)
            .then(() => {
                console.log(doc.id)
            })
            .catch(er => {
                ers.push(er);
            })
        })
        return ers.length === 0 ? res.status(200).send({result: true, message: "Terapeutas corregidos automaticamente"}) : res.status(400).send({errors: ers, message: "Errores al actualizar ciertos usuarios"})
    })
}

exports.fixAllTherapistsImage = (req, res) => {
    thers.get()
    .then( query => {
        var ers = [];
        var imgs = [];
        query.forEach( doc => {
            const numbers = ["2.jpg", "3.jpg", "4.jpg", "5.jpg", "9.jpg", "10.jpg", "12.jpg", "13.jpg", "15.jpg", "16.jpg", "17.jpg"]
            let rnd_img = "terapeutas/placeholders/".concat(numbers[Math.floor(Math.random() * numbers.length)])
            imgs.push(rnd_img);
            doc.ref.update({
                img: rnd_img
            })
            .then(() => {
                console.log(doc.id)
            })
            .catch(er => {
                ers.push(er);
            })
        })
        return ers.length === 0 ? res.status(200).send({result: true, message: "Imagenes de terapeutas corregidos automaticamente"}) : res.status(400).send({errors: ers, message: "Errores al actualizar ciertos usuarios"})
    })
}

Date.prototype.addHours = function(h) {
    this.setTime(this.getTime() + (h*60*60*1000));
    return this;
}

exports.fixAllSessions = (req, res) => {
    sessions.get()
    .then( query => {
        var ers = [];
        query.forEach( doc => {
            var data = doc.data();
            let randomUser;
            let randomTherapist;

            users.get()
            .then( queryUsers => {
                var docUser = queryUsers.docs[Math.floor(Math.random() * queryUsers.docs.length) % queryUsers.docs.length]
                randomUser = {id: docUser.id, data: docUser.data()}
                thers.get()
                .then( query => {
                    var docTher = query.docs[Math.floor(Math.random() * query.docs.length) % query.docs.length]
                    randomTherapist = {id: docTher.id, data: docTher.data()}
                })
                .then(() => {
                    var d8st = new Date();
                    var d8en = d8st.addHours((data.duration || 60) / 60);
                    let fixed_data = {
                        cost: data.cost || 60000,
                        duration: data.duration || 60,
                        start: data.start || d8st.toISOString(),
                        end: data.end || d8en.toISOString(),
                        note: data.note || "",
                        user: data.user || randomUser.id,
                        user_name: data.user_name || randomUser.data.name,
                        user_email: data.user_email || randomUser.data.email,
                        pay_met: data.pay_met || "",
                        pay_type: data.pay_type || 'card',
                        payed: data.payed || false,
                        therapist: data.therapist.toString() || randomTherapist.id.toString(),
                        ther_name: data.thername || randomTherapist.data.name || "Nombre terapeuta",
                        state: !data.state.isNaN() ? data.state : 0,
                        tipo: data.tipo || "Terapia adulto individual",
                    }
                    doc.ref.set(fixed_data)
                    .then(() => {
                        console.log(doc.id)
                    })
                    .catch(er => {
                        ers.push(er);
                    })
                })
            })
        })
        return ers.length === 0 ? res.status(200).send({result: true, message: "Sesiones corregidas automaticamente"}) : res.status(400).send({errors: ers, message: "Errores al actualizar ciertos usuarios"})
    })    
}

exports.fixAllBlogs = (req, res) => {
    blogs.get()
    .then( query => {
        var ers = [];
        query.forEach( doc => {
            var data = doc.data();
            let randomTherapist;

            thers.get()
            .then( query => {
                var docTher = query.docs[Math.floor(Math.random() * query.docs.length) % query.docs.length]
                randomTherapist = {id: docTher.id, data: docTher.data()}
            })
            .then(() => {
                var d8st = new Date();
                let fixed_data = {
                    author: data.author || randomTherapist.id,
                    comments: data.comments || [],
                    content: data.content || "<h1>Iknelia | Crea tu propio post</h1><p><a href='http://localhost:3000/dashboard/analytics' rel='noopener noreferrer' target='_blank'>en Iknelia</a></p><p>La psicoterapia es un proceso clínico que posibilita el autoconocimiento</p>",
                    date: (typeof data.date === 'string') ? data.date : d8st.toISOString(),
                    img: "/src/assets/images/videosession.png",
                    likes: data.likes || [],
                    title: data.title || "Titulo",
                }
                doc.ref.set(fixed_data)
                .then(() => {
                    console.log(doc.id)
                })
                .catch(er => {
                    ers.push(er);
                })
            })
        })
        return ers.length === 0 ? res.status(200).send({result: true, message: "Blogs corregidos automaticamente"}) : res.status(400).send({errors: ers, message: "Errores al actualizar ciertos usuarios"})
    })      
}

exports.fixAllNotes = (req, res) => {
    
}

exports.fixAllReviews = (req, res) => {
    
}

const user_schema = Joi.object({
    address: Joi.string()
        .alphanum()
        .min(3)
        .max(150)
        .required(),
    
    age: Joi.number()
        .integer()
        .min(18)
        .required(),

    answered: Joi.boolean()
        .required(),
        
    email: Joi.string()
        .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } })
        .required(),

    img: Joi.string()
        .alphanum()
        .min(3)
        .required(),

    lname: Joi.string()
        .alphanum()
        .min(3)
        .max(150)
        .required(),
    name: Joi.string()
        .alphanum()
        .min(3)
        .max(150)
        .required(),

    payment_met: Joi.array(),

    phone: Joi.string()
        .alphanum()
        .min(10)
        .max(14)
        .required(),

    therapist: Joi.string()
        .alphanum()
        .min(3)
        .max(150)
        .required(),

})