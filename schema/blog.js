class Blog {
    constructor (title, content, date, author, likes, comments, img) {
        this.title = title;
        this.content = content;
        this.date = date;
        this.author = author;
        this.likes = likes;
        this.comments = comments;
        this.img = img
    }

    toString() {
        return this.author + ': ' + this.title + '\n' + this.date + ' | likes: ' + this.likes.length + ' | comms: ' + this.comments.length;
    }
}

var blogConverter = {
    toFirestore: (blog) => {
        return {
            title: blog.title,
            content: blog.content,
            date: blog.date,
            author: blog.author,
            likes: blog.likes,
            comments: blog.comments,
            img: blog.img,
        }
    },
    fromFirestore: (snapshot, options) => {
        const data = snapshot.data(options);
        return new User(
            data.title, 
            data.content, 
            data.date, 
            data.author, 
            data.likes, 
            data.comments, 
            data.img,
        );
    }
}

module.exports = { Blog, blogConverter }