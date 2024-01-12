// aquí se programan las funciones de las rutas de la API
// tengo que traer los modelos de la base de datos para poder guardar los datos
import { User } from '../models/User.js';
import { Op } from 'sequelize';


// para capturar los errores colocamos todos los métodos en un try catch
// obtener todos los usuario de la base de datos user

export const getUsers = async (req, res) => {
  try {
    const { sort, order } = req.query;

    let orderCriteria = [['last_name', 'ASC']]; // Default sorting criteria

    // Check if sort and order parameters are provided
    if (sort && order) {
      // Validate that the provided sort column is one of the allowed columns
      const allowedColumns = ['id', 'first_name', 'last_name', 'email', 'phone'];
      if (allowedColumns.includes(sort)) {
        orderCriteria = [[sort, order.toUpperCase()]]; // Set the custom sorting criteria
      } else {
        // Handle invalid sort column
        return res.status(400).send('Invalid sort column');
      }
    }

    const users = await User.findAll({
      where: {
        status: 'active',	
      },
      order: orderCriteria,
    });

    // Convert the Sequelize instances to plain JSON objects
    const usersJson = users.map(user => user.toJSON());
    
    // Extract the 'removedUser' query parameter from the request
    let removedUser = req.query.removed;

    // Render the 'home' template with the retrieved users and 'removedUser'
    res.render('home', { rows: usersJson, removedUser });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).send('Internal Server Error');
  }
};

/*
export const getUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      where: {
        status: 'active',
      },
      order: [['last_name', 'ASC']], // Sort by last_name in ascending order
    });

    // Convert the Sequelize instances to plain JSON objects
    const usersJson = users.map(user => user.toJSON());
    
    // Extract the 'removedUser' query parameter from the request
    let removedUser = req.query.removed;

    // Render the 'home' template with the retrieved users and 'removedUser'
    res.render('home', { rows: usersJson, removedUser });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).send('Internal Server Error');
  }
};
*/


// Find User by Search 
export const findUser = async (req, res) => {
  try {
    // Get the search term
    let searchTerm = req.body.search;
    // console.log(searchTerm);

    // Use Sequelize to find users with similar first_name or last_name
    const users = await User.findAll({
      where: {
        [Op.or]: [
          { first_name: { [Op.like]: `%${searchTerm}%` } },
          { last_name:  { [Op.like]: `%${searchTerm}%` } },
          { email:      { [Op.like]: `%${searchTerm}%` } },
        ],
      },
    });
    // Convert the Sequelize instances to plain JSON objects
    const usersJson = users.map(user => user.toJSON());

    // Render the 'home' template with the retrieved users
    res.render('home', { rows: usersJson });
  } catch (error) {
    // Handle any errors that occur during the database query
    console.error('Error finding users:', error);
    res.status(500).send('Internal Server Error');
  }
};

// Render the user  
export const form = (req, res) => {
  res.render('./user/add-user');
} 

// Create User
  export const create = async (req, res) => {
    try {
      // Deconstruct the object
      const { first_name, last_name, email, phone, comments } = req.body;  
      // Use Sequelize to insert a new user
      const newUser = await User.create({
        first_name,
        last_name,
        email,
        phone,
        comments,
      });
      // Render the 'add-user' template with an alert message
      res.render('./user/add-user', { alert: 'User added successfully.' }); 
    } catch (error) {
      // Handle any errors that occur during the database query
      console.error('Error adding user:', error);
      res.status(500).send('Internal Server Error');
    }
  };

// Edit user
export const edit = async (req, res) => {
  try {
    // Use Sequelize to find a user by ID
   const user = await User.findOne({
    where: {
      id: req.params.id,
    },
  });

    if (user) {
      // the information we get from the user is stored in the dataValues property of the user object
      // this is the reason why in the edit-user.hbs we use {{user.dataValues.first_name}}
      // console.log(user.dataValues.id);
      // console.log(user.dataValues.first_name);
      // console.log(user.dataValues.last_name);
      // Render the 'edit-user' template with the retrieved user
      res.render('./user/edit-user', { user });
    } else {
      // Handle the case where the user with the specified ID is not found
      res.status(404).send('User not found');
    }
  } catch (error) {
    // Handle any errors that occur during the database query
    console.error('Error retrieving user:', error);
    res.status(500).send('Internal Server Error');
  }
};


// Update User
// Update User
export const update = async (req, res) => {
  try {
    const userId = req.params.id;
   
    // Check if userId is a valid integer
    // console.log("User Id: " +userId);
    // if (!Number.isInteger(Number(userId))) {
    //   return res.status(400).send('Invalid user ID');
    // }

    const { first_name, last_name, email, phone, comments } = req.body;

    // Use Sequelize to find the user
    const user = await User.findByPk(userId);

    // Check if the user exists
    if (!user) {
      return res.status(404).send('User not found');
    }

    // Update the user
    await user.update({
      first_name,
      last_name,
      email,
      phone,
      comments,
    });

    // Retrieve the updated user
    const updatedUser = await User.findByPk(userId);

    // Render the 'edit-user' template with the updated user and an alert message
    res.render('./user/edit-user', { user: updatedUser, alert: `${first_name} has been updated.` });
  } catch (error) {
    // Handle any errors that occur during the update
    console.error('Error updating user:', error);
    res.status(500).send('Internal Server Error');
  }
};



// Delete user
// Update user status to inactive
export const deactivateUser = async (req, res) => {
  try {
    // Use Sequelize to update the user status
    const [updatedRowCount] = await User.update(
      { status: 'inactive' }, // Assuming there's a column named 'status' in your User model
      {
        where: {
          id: req.params.id,
        },
      }
    );

    if (updatedRowCount > 0) {
      // If the update was successful, redirect with a success message
      let deactivatedUser = encodeURIComponent('User successfully deactivated.');
      res.redirect('/?deactivated=' + deactivatedUser);
    } else {
      // Handle the case where the user with the specified ID is not found
      res.status(404).send('User not found');
    }
  } catch (error) {
    // Handle any errors that occur during the database update
    console.error('Error deactivating user:', error);
    res.status(500).send('Internal Server Error');
  }
};


/*
export const deleteUser = async (req, res) => {
  try {
    // Use Sequelize to delete a user
    const deletedRowCount = await User.destroy({
      where: {
        id: req.params.id,
      },
    });

    if (deletedRowCount > 0) {
      // If the deletion was successful, redirect with a success message
      let removedUser = encodeURIComponent('User successfully removed.');
      res.redirect('/?removed=' + removedUser);
    } else {
      // Handle the case where the user with the specified ID is not found
      res.status(404).send('User not found');
    }
  } catch (error) {
    // Handle any errors that occur during the database deletion
    console.error('Error deleting user:', error);
    res.status(500).send('Internal Server Error');
  }
};

^*/

// View User
export const viewUser = async (req, res) => {
  try {
    // Use Sequelize to find a user by ID
    const user = await User.findOne({
      where: {
        id: req.params.id,
      },
    });
      console.log(user.dataValues.id);
      console.log(user.dataValues.first_name);
      console.log(user.dataValues.last_name);

    if (user) {
      // Render the 'view-user' template with the retrieved user
      res.render('./user/view-user', { user });
    } else {
      // Handle the case where the user with the specified ID is not found
      res.status(404).send('User not found');
    }
  } catch (error) {
    // Handle any errors that occur during the database query
    console.error('Error viewing user:', error);
    res.status(500).send('Internal Server Error');
  }
};


// Controller details:
/*
getUsers Explanation:
1. **Import Sequelize Model:**
   const { User } = require('../models');
   - This line imports the Sequelize model for the `User` table from the `'../models'` directory. 
   Ensure that the path is correct based on your project structure.

2. **Async Function:**
   exports.view = async (req, res) => { ... }
   - This controller function is marked as `async`, indicating that it contains asynchronous operations. 
   The `async` keyword allows the use of `await` within the function.

3. **Fetching Users with Sequelize:**
   const users = await User.findAll({
     where: {
       status: 'active',
     },
   });
   - This line uses the Sequelize model's `findAll` method to retrieve all users where the `status` is 'active' 
   (indicating that the user is active). The `where` clause is used to filter the results from the `User` table.

4. **Converting Sequelize Instances to JSON:**
   const usersJson = users.map(user => user.toJSON());
   - This line maps through the array of Sequelize instances (`users`) and uses the `toJSON` method for each instance. 
   This converts each Sequelize instance to a plain JavaScript object, resolving any prototype-related issues for Handlebars.

5. **Extracting Query Parameter:**
   let removedUser = req.query.removed;
   - This line extracts the 'removedUser' query parameter from the request. It's used later in rendering the template. 
   In the provided home.hbs file, the line {{#if removedUser}} is used to conditionally display an alert if removedUser is truthy. 
   The removedUser variable is set in the controller based on the presence of the removed query parameter in the request 
   (let removedUser = req.query.removed;).  The purpose of this is to show an alert message when a user has been removed, 
   and the removed query parameter is usually set when a user is deleted. 
   However, its presence or absence should not directly affect the rendering of the table itself, 
   as it is used for displaying an alert message.

6. **Rendering Handlebars Template:**
   res.render('home', { rows: usersJson, removedUser });
   - This line renders the 'home' template using the `res.render` method. It passes an object with two properties:
    `rows` (containing the retrieved users) and `removedUser` (the extracted query parameter).

7. **Handling Errors:**
   } catch (error) {
     console.error('Error fetching users:', error);
     res.status(500).send('Internal Server Error');
   }
   - This block catches any errors that may occur during the database query. If an error occurs, it logs the error 
   and sends a 500 Internal Server Error response to the client.

In summary, this controller fetches users with a 'status' of 'active' from the database using Sequelize, 
converts the Sequelize instances to plain JSON objects, extracts a query parameter, and renders a Handlebars template 
with the retrieved users and query parameter. 
Any errors during the process are logged and result in a 500 Internal Server Error response.
*/


// Find User by Search details
/*
1) let searchTerm = req.body.search;:
This line extracts the search term from the request body. It assumes that the search term is sent as part of the request body (e.g., in a form submission or an API request). The search term is stored in the variable searchTerm for later use.

2) User.findAll() is a Sequelize method that retrieves all instances of the User model that match the specified criteria.
The criteria are defined in the where clause of the query.
[Op.or] is an operator that indicates an OR condition. It allows finding users where at least one of the specified conditions is true.
The conditions are enclosed in an array, and each condition represents a field (first_name, last_name, and email) to be checked for similarity to the search term.

{ [Op.like]: %${searchTerm}% } is a Sequelize condition using the Op.like operator, which performs a case-insensitive pattern match. It checks if the specified field contains the search term.

In summary, the provided code searches for users in the database where the first_name, last_name, or email fields are similar to the searchTerm. It uses Sequelize's Op.like operator for pattern matching. This can be useful for implementing a search functionality where users are filtered based on certain criteria.
*/

// Create user details
/*
2. **Async Function:**
   export const create = async (req, res) => { ... }
   - This controller function is marked as `async`, indicating that it contains asynchronous operations. The `async` keyword allows the use of `await` within the function.

3. **Deconstruct Request Body:**
   const { first_name, last_name, email, phone, comments } = req.body;
   - This line uses object destructuring to extract properties (`first_name`, `last_name`, `email`, `phone`, `comments`) from the request body.

4. **Inserting a New User with Sequelize:**
   const newUser = await User.create({
     first_name,
     last_name,
     email,
     phone,
     comments,
   });
   - This uses the Sequelize model's `create` method to insert a new user into the database. It's a more convenient way than writing raw SQL queries for insertion.

5. **Rendering Handlebars Template:**
   res.render('add-user', { alert: 'User added successfully.' });
   - This line renders the 'add-user' template using the `res.render` method. It includes an alert message indicating that the user was added successfully.

6. **Handling Errors:**
   } catch (error) {
     console.error('Error adding user:', error);
     res.status(500).send('Internal Server Error');
   }
   - This block catches any errors that may occur during the database query. If an error occurs, it logs the error and sends a 500 Internal Server Error response to the client.

This modified controller achieves the same functionality as the original SQL-based controller but utilizes Sequelize for better query abstraction and readability.
*/

// Edit user details
/*
Explanation:
1. **Async Function:**
   - The controller function is marked as `async`, indicating that it contains asynchronous operations. The `async` keyword allows the use of `await` within the function.

2. **Finding User by ID using Sequelize:**
   - `const user = await User.findOne({ where: { id: req.params.id } });`
   - This line uses Sequelize's `findOne` method to retrieve a single user from the `User` model based on the provided `id`. The `where` clause specifies the condition for the search.

3. **Handling User Existence:**
   - `if (user) { ... } else { ... }`
   - If a user with the specified `id` is found, the code inside the `if` block is executed. If not, it goes to the `else` block.

4. **Logging User Details (Optional):**
   - The commented lines starting with `// console.log(user.dataValues.id);` are optional and can be used for debugging purposes. They log specific properties of the user object, such as `id`, `first_name`, and `last_name`, to the console.

5. **Rendering the Template:**
   - `res.render('edit-user', { user });`
   - If a user is found, the controller renders the 'edit-user' template and passes the user object to it. This user object is then accessible within the Handlebars template.

6. **Handling User Not Found:**
   - If no user is found with the specified `id`, the controller sends a 404 status and a 'User not found' message to the client.

7. **Error Handling:**
   - `try { ... } catch (error) { ... }`
   - The entire operation is wrapped in a try-catch block to handle any errors that may occur during the database query. If an error occurs, it logs the error and sends a 500 Internal Server Error response to the client.

In summary, this controller fetches a user by ID from the database using Sequelize, handles cases where the user is found or not found, logs user details for debugging if needed, renders the 'edit-user' template with the user object, and handles errors during the process.
*/

// Update user details
/*
Explanation:
1. **Handling Form Data:**
   - `const { first_name, last_name, email, phone, comments } = req.body;`
   - This line destructures the `req.body` object to extract the values of form fields (first_name, last_name, email, phone, comments) submitted in the POST request.

2. **Try-Catch Block:**
   - `try { ... } catch (error) { ... }`
   - The entire operation is wrapped in a try-catch block to handle any errors that may occur during the database update. If an error occurs, it logs the error and sends a 500 Internal Server Error response to the client.

3. **Updating User with Sequelize:**
   - `const [updatedRowCount] = await User.update({ ... }, { where: { id: req.params.id } });`
   - This line uses Sequelize's `update` method to update the user in the database. It specifies the new values for the user (first_name, last_name, email, phone, comments) and the condition for the update (where id is equal to req.params.id). The method returns an array, and `[updatedRowCount]` destructures the array to get the number of updated rows.

4. **Checking Update Result:**
   - `if (updatedRowCount > 0) { ... } else { ... }`
   - If one or more rows were updated (updatedRowCount > 0), the code inside the `if` block is executed. Otherwise, it goes to the `else` block, indicating that the user with the specified ID was not found.

5. **Retrieve Updated User:**
   - `const updatedUser = await User.findByPk(req.params.id);`
   - If the update was successful, this line retrieves the updated user from the database using `findByPk` (find by primary key) method.

6. **Rendering Template with Updated User:**
   - `res.render('edit-user', { user: updatedUser, alert: `${first_name} has been updated.` });`
   - The controller renders the 'edit-user' template with the updated user object and an alert message indicating the success of the update.

7. **Handle User Not Found:**
   - `res.status(404).send('User not found');`
   - If no user is found with the specified ID, the controller sends a 404 status and a 'User not found' message to the client.

8. **Handle Errors:**
   - `console.error('Error updating user:', error);`
   - If an error occurs during the database update, it logs the error and sends a 500 Internal Server Error response to the client.

In summary, this controller updates a user in the database using Sequelize, checks if the update was successful, retrieves the updated user, and renders the 'edit-user' template with the updated user and an alert message. It also handles cases where the user with the specified ID is not found or an error occurs during the update process.
*/

// Delete user details
/*
Explanation:
2. **Try-Catch Block:**
   - `try { ... } catch (error) { ... }`
   - The entire operation is wrapped in a try-catch block to handle any errors that may occur during the database deletion. If an error occurs, it logs the error and sends a 500 Internal Server Error response to the client.

3. **Deleting User with Sequelize:**
   - `const deletedRowCount = await User.destroy({ where: { id: req.params.id } });`
   - This line uses Sequelize's `destroy` method to delete a user from the database. It specifies the condition for deletion (where id is equal to req.params.id). The method returns the number of rows deleted.

4. **Checking Delete Result:**
   - `if (deletedRowCount > 0) { ... } else { ... }`
   - If one or more rows were deleted (deletedRowCount > 0), the code inside the `if` block is executed. Otherwise, it goes to the `else` block, indicating that the user with the specified ID was not found.

5. **Redirecting with Success Message:**
   - `let removedUser = encodeURIComponent('User successfully removed.');`
   - `res.redirect('/?removed=' + removedUser);`
   - If the deletion was successful, it redirects to the home page with a success message in the URL query parameter.

6. **Handle User Not Found:**
   - `res.status(404).send('User not found');`
   - If no user is found with the specified ID, the controller sends a 404 status and a 'User not found' message to the client.

7. **Handle Errors:**
   - `console.error('Error deleting user:', error);`
   - If an error occurs during the database deletion, it logs the error and sends a 500 Internal Server Error response to the client.

This controller uses Sequelize's `destroy` method for deleting a user, providing a more modern and structured approach compared to direct SQL queries.
*/