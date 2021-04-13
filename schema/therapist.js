/* eslint-disable require-jsdoc */
class Therapist {
  constructor(age, email, img, name, resume, payment_met, phone, sessions, users, blogs) {
    this.age = age;
    this.email = email;
    this.img = img;
    this.name = name;
    this.resume = resume;
    this.payment_met = payment_met;
    this.phone = phone;
    this.sessions = sessions;
    this.users = users;
    this.blogs = blogs;
  }

  toString() {
    return this.name + ", " + this.age + ". " + this.email;
  }
}

const therapistConverter = {
  toFirestore: (therapist) => {
    return {
      age: therapist.age,
      email: therapist.email,
      img: therapist.img,
      name: therapist.name,
      resume: therapist.resume,
      payment_met: therapist.payment_met,
      phone: therapist.phone,
      sessions: therapist.sessions,
      therapist: therapist.therapist,
    };
  },
  fromFirestore: (snapshot, options) => {
    const data = snapshot.data(options);
    return new Therapist(
        data.age,
        data.email,
        data.img,
        data.name,
        data.resume,
        data.payment_met,
        data.phone,
        data.sessions,
        data.patients,
        data.blogs,
    );
  },
};

module.exports = {Therapist, therapistConverter};
