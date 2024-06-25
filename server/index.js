const express = require("express");
const app = express();
const cors = require("cors");
const pool = require("./db");
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

//middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

//ROUTES
//Create client
app.post('/client', async(req, res) => {
    try {
       // console.log(req.body);
        const {username, email, password, role} = req.body;
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(password, salt);
        const newClient = await pool.query("INSERT INTO client (username, email, password, role) VALUES($1, $2, $3, $4) RETURNING *",
        [username, email, hashedPassword, role]);
        const token = jwt.sign({ email }, 'secret', { expiresIn: '1hr' });

        res.json({ username, email, role, user_id: newClient.rows[0].id, token });
    } catch (error) {
        console.error(error.message)
        if(error){
            res.json({detail: error.detail})
        }
    }
})

//login client
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
      const user = await pool.query('SELECT * FROM client WHERE username = $1', [username]);
      console.log("User:", user.rows[0]);
  
      if (!user.rows.length) return res.json({ detail: 'User does not exist' });
  
      const hashedPassword = user.rows[0].password;
      const match = await bcrypt.compare(password, hashedPassword);   
  
      if (match) {
        const token = jwt.sign({ username }, 'secret', { expiresIn: '1hr' });
        res.json({ email: user.rows[0].email,
                   username: user.rows[0].username,
                   role: user.rows[0].role,
                   client_id: user.rows[0].client_id,
                  token 
                });
      } else {
        res.json({ detail: 'Login failed' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Login failed' });
    }
  });

//Category api
//create category
app.post('/category', async(req, res) => {
    try {
       // console.log(req.body);
        const {category_name, created_at} = req.body;
        const newcategory = await pool.query("INSERT INTO category (category_name, created_at) VALUES($1, $2) RETURNING *",
        [category_name, created_at]);

        res.json(newcategory);
    } catch (error) {
        console.error(error.message)
    }
})

//get all category
app.get('/category', async(req, res) => {
    try {
      const allcategories = await pool.query('SELECT * FROM category');
      res.json(allcategories.rows);
    } catch (error) {
        console.error(error.message);
        
    }
})

//get category
app.get('/category/:category_id', async(req, res) => {
    try {
        console.log(req.params);
        const {category_id} = req.params;
        const category = await pool.query('SELECT * FROM tablecategory WHERE id = $1', [category_id]);
        res.json(category.rows[0]);
    } catch (error) {
        console.error(error.message)
    }
})

//update category
app.put('/category/:category_id', async(req, res) => {
    try {
       const {category_id} = req.params;
       const {category_name, created_at} = req.body;
       const updatecategory =  await pool.query('UPDATE category SET category_name = $1 WHERE id = $2',
       [category_name, category_id]);
       res.json('category data was updated');
    } catch (error) {
        console.error(error.message);
    }
})

//delete category
app.delete('/category/:category_id', async(req, res) => {
    try {
        const {category_id} = req.params;
        const deletecategory = pool.query('DELETE FROM category WHERE id = $1', [category_id]);
        res.json('category was deleted')
    } catch (error) {
        console.error(error.message)
    }
})

//events api
// Create an event
app.post('/events', async (req, res) => {
    try {
      const { event_name, event_description, event_startdate, event_enddate, event_image, eventcategory_id, location, } = req.body;
      const newEvent = await pool.query(
        'INSERT INTO event (event_name, event_description, event_startdate, event_enddate, event_image, eventcategory_id, location,) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
        [event_name, event_description, event_startdate, event_enddate, event_image, eventcategory_id, location,]
      );
      res.json(newEvent.rows[0]);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  });
  
  // Get all events
  app.get('/events', async (req, res) => {
    try {
      const allEvents = await pool.query('SELECT * FROM event');
      res.json(allEvents.rows);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  });
  
// Get events by category name
app.get('/events/category/:categoryName', async (req, res) => {
    try {
      const { categoryName } = req.params;
      const events = await pool.query('SELECT * FROM event WHERE eventcategory_id IN (SELECT category_id FROM category WHERE category_name = $1)', [categoryName]);
  
      if (events.rows.length === 0) {
        return res.status(404).json({ message: 'No events found for this category name' });
      }
  
      res.json(events.rows);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  });  

   //create packages API
  //post package
  app.post('/packages', async (req, res) => {
    const { package_name, package_description, package_amount, event_id } = req.body;

    try {
        const result = await pool.query(
            'INSERT INTO package (package_name, package_description, package_amount, event_id) VALUES ($1, $2, $3, $4) RETURNING *',
            [package_name, package_description, package_amount, event_id]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error inserting package:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// API endpoint to get all packages
app.get('/packages', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM package');
        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Error retrieving packages:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// API endpoint to get a single package by ID
app.get('/packages/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query('SELECT * FROM package WHERE package_id = $1', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Package not found' });
        }

        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error('Error retrieving package:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// API endpoint to update a package by ID
app.put('/packages/:id', async (req, res) => {
    const { id } = req.params;
    const { package_name, package_description, package_amount, event_id } = req.body;

    try {
        const result = await pool.query(
            'UPDATE package SET package_name = $1, package_description = $2, package_amount = $3, event_id = $4 WHERE package_id = $5 RETURNING *',
            [package_name, package_description, package_amount, event_id, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Package not found' });
        }

        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error('Error updating package:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// API endpoint to delete a package by ID
app.delete('/packages/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query('DELETE FROM package WHERE package_id = $1 RETURNING *', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Package not found' });
        }

        res.status(200).json({ message: 'Package deleted successfully' });
    } catch (err) {
        console.error('Error deleting package:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});


app.listen(5000, () => {
    console.log("server started on port 5000");
});
