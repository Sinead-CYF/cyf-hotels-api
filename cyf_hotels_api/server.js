const express = require("express");
const app = express();

const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'cyf_hotels',
    password: "Sinnyozzy91",
    port: 5432
});

app.get("/hotels", function(req, res) {
    pool.query('SELECT * FROM hotels')
        .then((result) => res.json(result.rows))
        .catch((error) => {
            console.error(error);
            res.status(500).json(error);
        });
});

app.listen(3000, function() {
    console.log("Server is listening on port 3000. Ready to accept requests!");
});

