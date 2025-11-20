function getUserById(id) {
    return database.users.find(user => user.id === id);
}

function getPostById(id) {
    return database.posts.find(post => post.id === id);
}

function getCommentById(id) {
    return database.comments.find(comment => comment.id === id);
}

function getProductById(id){
    return database.products.find(product => product.id === id);
}