// imports
const express = require("express");
const app = express();
app.use(express.json());
const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "cyf_hotels",
  password: "Sinnyozzy91",
  port: 5432,
});

// root
app.get("/", function (req, res) {
  res.send("Sinead's CYF Hotels API <br> test");
});

// all hotels ordered by name & query params for hotel search
app.get("/hotels", function (req, res) {
  const hotelNameQuery = req.query.name;
  let query = `SELECT * FROM hotels ORDER BY name`;
  let params = [];
  if (hotelNameQuery) {
    query = `SELECT * FROM hotels WHERE name LIKE $1 ORDER BY name`;
    params.push(`%${hotelNameQuery}%`);
  }

  pool
    .query(query, params)
    .then((result) => res.json(result.rows))
    .catch((error) => {
      console.error(error);
      res.status(500).json(error);
    });
});

/* 
Follow the above steps to create a new POST endpoint /hotels to create a new hotel. 
Make sure to add validation for the number of rooms and the hotel name. 
Test your new API endpoint with Postman and check that the new hotel 
has been correctly created in your database. Add a new POST API endpoint to create a 
new customer in the customers table. Add validation to check that there is no other 
customer with the same name in the customers table before creating a new customer.
*/

// search hotel by ID
app.get("/hotels/:hotelId", function (req, res) {
  const hotelId = req.params.hotelId;

  pool
    .query("SELECT * FROM hotels WHERE id=$1", [hotelId])
    .then((result) => res.json(result.rows))
    .catch((error) => {
      console.error(error);
      res.status(500).json(error);
    });
});

/*
Add the GET endpoints /hotels and /hotels/:hotelId mentioned above and try to 
use these endpoints with Postman. Add a new GET endpoint /customers to load all 
customers ordered by name. Add a new GET endpoint /customers/:customerId to load 
one customer by ID. Add a new GET endpoint /customers/:customerId/bookings to load 
all the bookings of a specific customer. Returns the following information: 
check in date, number of nights, hotel name, hotel postcode.
*/

// add new hotel with validation
app.post("/hotels", function (req, res) {
  const newHotelName = req.body.name;
  const newHotelRooms = req.body.rooms;
  const newHotelPostcode = req.body.postcode;

  if (!Number.isInteger(newHotelRooms) || newHotelRooms <= 0) {
    return res
      .status(400)
      .send("The number of rooms should be a positive integer.");
  }

  pool
    .query("SELECT * FROM hotels WHERE name=$1", [newHotelName])
    .then((result) => {
      if (result.rows.length > 0) {
        return res
          .status(400)
          .send("A hotel with the same name already exists!");
      } else {
        const query =
          "INSERT INTO hotels (name, rooms, postcode) VALUES ($1, $2, $3)";
        pool
          .query(query, [newHotelName, newHotelRooms, newHotelPostcode])
          .then(() => res.send("Hotel created!"))
          .catch((error) => {
            console.error(error);
            res.status(500).json(error);
          });
      }
    });
});

// updating customer info
app.put("/customers/:customerId", function (req, res) {
  const customerId = req.params.customerId;
  const newEmail = req.body.email;

  pool
    .query("UPDATE customers SET email=$1 WHERE id=$2", [newEmail, customerId])
    .then(() => res.send(`Customer ${customerId} updated!`))
    .catch((error) => {
      console.error(error);
      res.status(500).json(error);
    });
});

/*
Add the PUT endpoint /customers/:customerId and verify you can update 
a customer email using Postman. Add validation for the email before updating 
the customer record in the database. If the email is empty, return an error message.
Add the possibility to also update the address, the city, the postcode and the country 
of a customer. Be aware that if you want to update the city only for example, 
the other fields should not be changed!
*/

// delete customer bookings
app.delete("/customers/:customerId", function (req, res) {
  const customerId = req.params.customerId;

  pool
    .query("DELETE FROM bookings WHERE customer_id=$1", [customerId])
    .then(() => pool.query("DELETE FROM customers WHERE id=$1", [customerId]))
    .then(() => res.send(`Customer ${customerId} deleted!`))
    .catch((error) => {
      console.error(error);
      res.status(500).json(error);
    });
});

// delete a customer
app.delete("/customers/:customerId", function (req, res) {
  const customerId = req.params.customerId;

  pool
    .query("DELETE FROM customers WHERE id=$1", [customerId])
    .then(() => res.send(`Customer ${customerId} deleted!`))
    .catch((error) => {
      console.error(error);
      res.status(500).json(error);
    });
});

/*
Add the DELETE endpoint /customers/:customerId above and verify you can delete 
a customer along their bookings with Postman. Add a new DELETE endpoint /hotels/:hotelId 
to delete a specific hotel. Note: A hotel can only be deleted if it doesn't appear in 
any of the customers' bookings! Make sure you add the corresponding validation 
before you try to delete a hotel.
*/

app.listen(3000, function () {
  console.log("Server is listening on port 3000. Ready to accept requests!");
});
