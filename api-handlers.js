/**
 * API Handlers Practice
 * Use Tab to generate common handler patterns
 */

// TODO: Type handler signatures and let Tab suggest complete implementations

// Exercise 1: Type "async function handleGetRequest(req, res) {" and let Tab suggest
async function handleGetRequest(req, res) {
    try {
        const data = await getData();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
}

// Exercise 2: Type "async function handlePostRequest(req, res) {" and let Tab suggest


// Exercise 3: Type "async function handleUpdateRequest(req, res) {" and let Tab suggest


// Exercise 4: Type "async function handleDeleteRequest(req, res) {" and let Tab suggest


// Exercise 5: Create error handler - type "function errorHandler(error, req, res, next) {"


// Exercise 6: Create middleware - type "function authMiddleware(req, res, next) {"

