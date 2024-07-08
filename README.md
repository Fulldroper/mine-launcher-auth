The purpose of this project is to create an authentication server for a Minecraft launcher with support for mods and a server news feed.

### Project Benefits
This project provides a secure authentication mechanism for players accessing the Minecraft server, along with the ability to stay updated with server news.

### How the Project Works
The project sets up an authentication server using Node.js that manages user credentials and session tokens, and provides endpoints for retrieving server news.

### Repository and Installation
[GitHub Repository](https://github.com/Fulldroper/mine-launcher-auth)
- front-end repo: https://github.com/Fulldroper/mine-launcher

To install and run the project:

1. Clone the repository:
    ```bash
    git clone https://github.com/Fulldroper/mine-launcher-auth
    cd mine-launcher-auth
    ```

2. Install dependencies and start the server:
    ```bash
    npm install
    npm start
    ```

### Project Workflow
1. **Setup Project:** Initialize the project structure and dependencies.
    ```bash
    npm init
    npm install
    ```

2. **Implement Authentication:** Create endpoints for user registration, login, and session management.
    ```javascript
    const express = require('express');
    const app = express();
    app.use(express.json());

    let users = [];

    app.post('/register', (req, res) => {
        const { username, password } = req.body;
        users.push({ username, password });
        res.status(201).send('User registered');
    });

    app.post('/login', (req, res) => {
        const { username, password } = req.body;
        const user = users.find(u => u.username === username && u.password === password);
        if (user) {
            res.status(200).send('Login successful');
        } else {
            res.status(401).send('Invalid credentials');
        }
    });

    app.listen(3000, () => {
        console.log('Server running on port 3000');
    });
    ```

3. **News Feed Endpoint:** Provide an endpoint for retrieving server news.
    ```javascript
    app.get('/news', (req, res) => {
        res.json([
            { title: 'Server Update', content: 'New mods added!' },
            { title: 'Event', content: 'Join our weekend event.' }
        ]);
    });
    ```

### Skills Gained
- Developing authentication systems with Node.js
- Managing user sessions and credentials
- Creating RESTful API endpoints for news feeds
