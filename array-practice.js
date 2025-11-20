/**
 * Array Operations Practice
 * Let Tab suggest array methods based on variable names
 */

const products = [
  { id: 1, name: 'Laptop', price: 999, category: 'electronics', stock: 5 },
  { id: 2, name: 'Mouse', price: 25, category: 'electronics', stock: 50 },
  { id: 3, name: 'Desk', price: 300, category: 'furniture', stock: 10 },
  { id: 4, name: 'Chair', price: 150, category: 'furniture', stock: 20 },
  { id: 5, name: 'Monitor', price: 400, category: 'electronics', stock: 8 }
];

// TODO: Type variable names and let Tab suggest the operations
const users = [
  { name: 'Alice', age: 25, active: true },
  { name: 'Bob', age: 30, active: false },
  { name: 'Charlie', age: 35, active: true }
];

// Exercise 1: Filter active users
// Type: const activeUsers = 
const activeUsers = users.filter(user => user.active);
console.log(activeUsers);

// Exercise 2: Get all user names
// Type: const userNames = 
const userNames = users.map(user => user.name);
console.log(userNames);

// Exercise 3: Calculate total age
// Type: const totalAge = 
const totalAge = users.reduce((acc, user) => acc + user.age, 0);
console.log(totalAge);

const hadadult = users.some(user => user.age >= 18);
console.log(hadadult);

// Exercise 4: Check if any user is admin
// Type: const hasAdmin =


// Exercise 5: Find user by name
// Type: const findUserByName = (name) =>


// Exercise 6: Get electronics products
// Type: const electronics =


// Exercise 7: Calculate total inventory value
// Type: const totalValue =


// Exercise 8: Get product names sorted
// Type: const sortedProductNames =


// Exercise 9: Group products by category
// Type: const productsByCategory =


// Exercise 10: Check if all products in stock
// Type: const allInStock = 

