const { firebase } = require('../firebase');
var db = firebase.firestore();
var notifs = db.collection("notifications");

/*
 * Tipos de notificaciones:
    - Creacion de sesion (ambos)
    - Sesion completada (ambos)
    - Pago recibido (terapeuta)
    - Pago efectuado (user)
    - Proximidad de cita (escribir el time watcher)

*/


exports.createNotification = (req, res) => {
    /* 
    * req.body.notifdata = {
        @uid,
        @therapist_id,
        @type: {
            - (ns) new_session
            - (cs) completed_session
            - (pr) payment_received
            - (pc) payment_completed
            - (sp) session_proximity
        @ } 
         
    * }
    */
    notifs
        .add(req.body.notifdata)
        .then( doc => {
            
        })
}

exports.readNotification = (req, res) => {}

exports.createNotification = (req, res) => {}

exports.createNotification = (req, res) => {}

exports.createNotification = (req, res) => {}