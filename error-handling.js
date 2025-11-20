/**
 * Error Handling Practice
 * Use Tab to generate try-catch patterns
 */

// TODO: Type try-catch blocks and let Tab suggest error handling

// Exercise 1: API call error handling
// Type: async function fetchData(url) {
async function fetchData(url) {
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

// Exercise 2: File operation error handling
// Type: async function readFile(path) {


// Exercise 3: Database query error handling
// Type: async function queryDatabase(sql) {


// Exercise 4: Validation error handling
// Type: function validateUserInput(data) {


// Exercise 5: Multiple catch scenarios
// Type: async function complexOperation() {
//   try {
//     // Let Tab suggest operations
//   } catch (error) {
//     // Let Tab suggest error handling
//   }
// }

