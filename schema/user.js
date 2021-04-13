class User {
    constructor (age, email, img, name, payment_met, phone, sessions, therapist) {
        this.age = age;
        this.email = email;
        this.img = img;
        this.name = name;
        this.payment_met = payment_met;
        this.phone = phone;
        this.sessions = sessions;
        this.therapist = therapist;
    }

    toString() {
        return this.name + ', ' + this.age + '. ' + this.email + ' | ' + this.phone + ' | ' + this.therapist;
    }
}

var userConverter = {
    toFirestore: (user) => {
        return {
            age: user.age,
            email: user.email,
            img: user.img,
            name: user.name,
            payment_met: user.payment_met,
            phone: user.phone,
            sessions: user.sessions,
            therapist: user.therapist,
        }
    },
    fromFirestore: (snapshot, options) => {
        const data = snapshot.data(options);
        return new User(
            data.age, 
            data.email, 
            data.img, 
            data.name, 
            data.payment_met, 
            data.phone, 
            data.sessions, 
            data.therapist
        );
    }
}

module.exports = { User, userConverter }