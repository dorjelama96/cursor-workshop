const cart = {
  items: [],
  total: 0,
};

//different context
const auth = {
  user: null,
  token: null
}

function addToCart(item) {
  cart.items.push(item);
  cart.total += item.price;
}

function login(email, password) {
  auth.user = email;
  auth.token = password;
}

function logout() {
  auth.user = null;
  auth.token = null;
}