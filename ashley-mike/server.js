'use strict';
const pg = require('pg');
const fs = require('fs');
const express = require('express');

const PORT = process.env.PORT || 3000;
const app = express();

// Windows and Linux users: You should have retained the user/password from the pre-work for this course.
// Your OS may require that your conString is composed of additional information including user and password.
// const conString = 'postgres://USER:PASSWORD@HOST:PORT/DBNAME';

// Mac:
const conString = 'postgres://localhost:5432/lab08';
const client = new pg.Client(conString);

// REVIEWED: Use the client object to connect to our DB.
client.connect();


// REVIEWED: Install the middleware plugins so that our app can parse the request body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('./public'));


// REVIEWED: Routes for requesting HTML resources
app.get('/new-article', (request, response) => {
  // COMMENTED: What number(s) of the full-stack-diagram.png image correspond to the following line of code? Which method of article.js, if any, is interacting with this particular piece of `server.js`? What part of CRUD, if any, is being enacted/managed by this particular piece of code?
  // Diagram: 2 & 5
  // CRUD: READ
  response.sendFile('new.html', { root: './public' });
});


// REVIEWED: Routes for making API calls to use CRUD Operations on our database
app.get('/articles', (request, response) => {
  // COMMENTED: What number(s) of the full-stack-diagram.png image correspond to the following line of code? Which method of article.js is interacting with this particular piece of `server.js`? What part of CRUD is being enacted/managed by this particular piece of code?
  // Diagram: 2-5
  // Code: Article.fetchAll();
  // CRUD: READ
  client.query('SELECT * FROM articles')
    .then(function(result) {
      response.send(result.rows);
    })
    .catch(function(err) {
      console.error(err)
      response.status(500).send(err);
    })
});

app.post('/articles', (request, response) => {
  // COMMENTED: What number(s) of the full-stack-diagram.png image correspond to the following line of code? Which method of article.js is interacting with this particular piece of `server.js`? What part of CRUD is being enacted/managed by this particular piece of code?
  // Diagram: 5
  // Code: Article.insertRecord();
  // CRUD: UPDATE
  let SQL = `
    INSERT INTO articles(title, author, author_url, category, published_on, body)
    VALUES ($1, $2, $3, $4, $5, $6);
  `;

  let values = [
    request.body.title,
    request.body.author,
    request.body.author_url,
    request.body.category,
    request.body.published_on,
    request.body.body
  ]

  client.query(SQL, values)
    .then(function() {
      response.send('insert complete')
    })
    .catch(function(err) {
      console.error(err);
      response.status(500).send(err);
    });
});

app.put('/articles/:id', (request, response) => {
  // COMMENTED: What number(s) of the full-stack-diagram.png image correspond to the following line of code? Which method of article.js is interacting with this particular piece of `server.js`? What part of CRUD is being enacted/managed by this particular piece of code?
  // Diagram: 2-4
  // Code: Article.updateRecord();
  // CRUD: UPDATE

  let SQL = `UPDATE articles SET title=$1, author=$2, author_url=$3, category=$4, published_on=$5, body=$6 WHERE article_id=$7;`;
  let values = [
    request.body.title,
    request.body.author,
    request.body.author_url,
    request.body.category,
    request.body.published_on,
    request.body.body,
    request.params.id
  ];

  client.query(SQL, values)
    .then(() => {
      response.send('update complete')
    })
    .catch(err => {
      console.error(err);
      response.status(500).send(err);
    });
});

app.delete('/articles/:id', (request, response) => {
  // COMMENTED: What number(s) of the full-stack-diagram.png image correspond to the following line of code? Which method of article.js is interacting with this particular piece of `server.js`? What part of CRUD is being enacted/managed by this particular piece of code?
  // Diagram: 2-5
  // Code: Article.deleteRecord()
  // CRUD: DELETE

  let SQL = `DELETE FROM articles WHERE article_id=$1;`;
  let values = [request.params.id];

  client.query(SQL, values)
    .then(() => {
      response.send('Delete complete')
    })
    .catch(err => {
      console.error(err);
      response.status(500).send(err);
    });
});

app.delete('/articles', (request, response) => {
  // COMMENTED: What number(s) of the full-stack-diagram.png image correspond to the following line of code? Which method of article.js is interacting with this particular piece of `server.js`? What part of CRUD is being enacted/managed by this particular piece of code?
  // Diagram: 2-5
  // Code: Article.truncateTable();
  // CRUD: DELETE

  let SQL = 'DELETE FROM articles';
  client.query(SQL)
    .then(() => {
      response.send('Delete complete')
    })
    .catch(err => {
      console.error(err);
      response.status(500).send(err);
    });
});

// COMMENTED: What is this function invocation doing?
// This function invocation is loading the database. The function checks to see if a current table exists (by checking to see if there are any result rows in existance) and if it doesn't then it creates one and populates each article using the forEach method.
loadDB();

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}!`);
});


//////// ** DATABASE LOADER ** ////////
////////////////////////////////////////
function loadArticles() {
  // COMMENTED: What number(s) of the full-stack-diagram.png image correspond to the following line of code? Which method of article.js is interacting with this particular piece of `server.js`? What part of CRUD is being enacted/managed by this particular piece of code?
  // Diagram: 4-5
  // CRUD: CREATE & READ

  let SQL = 'SELECT COUNT(*) FROM articles';
  client.query(SQL)
    .then(result => {
      // REVIEWED: result.rows is an array of objects that PostgreSQL returns as a response to a query.
      // If there is nothing on the table, then result.rows[0] will be undefined, which will make count undefined. parseInt(undefined) returns NaN. !NaN evaluates to true.
      // Therefore, if there is nothing on the table, line below will evaluate to true and enter into the code block.
      if (!parseInt(result.rows[0].count)) {
        fs.readFile('./public/data/hackerIpsum.json', 'utf8', (err, fd) => {
          JSON.parse(fd).forEach(ele => {
            let SQL = `
              INSERT INTO articles(title, author, author_url, category, published_on, body)
              VALUES ($1, $2, $3, $4, $5, $6);
            `;
            let values = [ele.title, ele.author, ele.author_url, ele.category, ele.published_on, ele.body];
            client.query(SQL, values);
          })
        })
      }
    })
}

function loadDB() {
  // COMMENTED: What number(s) of the full-stack-diagram.png image correspond to the following line of code? Which method of article.js is interacting with this particular piece of `server.js`? What part of CRUD is being enacted/managed by this particular piece of code?
  // Diagram: 3-5
  // CRUD: CREATE & READ
  client.query(`
    CREATE TABLE IF NOT EXISTS articles (
      article_id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      author VARCHAR(255) NOT NULL,
      author_url VARCHAR (255),
      category VARCHAR(20),
      published_on DATE,
      body TEXT NOT NULL);`)
    .then(() => {
      loadArticles();
    })
    .catch(err => {
      console.error(err);
    });
}
