'use strict';

const fs = require('fs');
const express = require('express');
const pg = require('pg');

const PORT = process.env.PORT || 3000;
const app = express();

// Windows and Linux users: You should have retained the user/password from the pre-work for this course.
// Your OS may require that your conString is composed of additional information including user and password.



// PC: J, Ed and Harry
// const conString = 'postgres://user:PASSWORD@HOST:PORT/DBNAME';
//const conString = 'postgres://postgres:My1004CF@localhost:5432/lab08';
const conString = 'postgres://postgres:Seattle143@localhost:5432/lab08';
// Mac: J
// const conString = 'postgres://localhost:5432/lab_08';

const client = new pg.Client(conString);

// REVIEWED: Use the client object to connect to our DB.
client.connect();


// REVIEWED: Install the middleware plugins so that our app can parse the request body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('./public'));


// REVIEWED: Routes for requesting HTML resources
app.get('/new-article', (request, response) => {
  // COMMENT: What number(s) of the full-stack-diagram.png image correspond to the following line of code? Which method of article.js, if any, is interacting with this particular piece of `server.js`? What part of CRUD, if any, is being enacted/managed by this particular piece of code?
  // This gets the HTML ready for articles to be displayed.
  response.sendFile('new.html', { root: './public' });
});


// REVIEWED: Routes for making API calls to use CRUD Operations on our database
app.get('/articles', (request, response) => {
  // COMMENTED: What number(s) of the full-stack-diagram.png image correspond to the following line of code? Which method of article.js is interacting with this particular piece of `server.js`? What part of CRUD is being enacted/managed by this particular piece of code?
  // This gets the articles form the table and displays them.
  client.query('SELECT * FROM articles')
    .then(result => {
      response.send(result.rows);
    })
    .catch(err => {
      console.error(err)
      response.status(500).send(err);
    })
});

app.post('/articles', (request, response) => {
  // COMMENTED: What number(s) of the full-stack-diagram.png image correspond to the following line of code? Which method of article.js is interacting with this particular piece of `server.js`? What part of CRUD is being enacted/managed by this particular piece of code?
  // This posts a new article to the screen, number 5 in the diagram, and create a record in CRUD.
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

app.put('/articles/:article_id', (request, response) => {
  // COMMENTED: What number(s) of the full-stack-diagram.png image correspond to the following line of code? Which method of article.js is interacting with this particular piece of `server.js`? What part of CRUD is being enacted/managed by this particular piece of code?
  // This adds an article to the database table, update a record in crud, and insertRecord in article.js

  let SQL = `
  UPDATE articles;(title, author, author_url, category, published_on, body)
  VALUES ($1, $2, $3, $4, $5, $6);
`;
  let values = [
    request.body.title,
    request.body.author,
    request.body.author_url,
    request.body.category,
    request.body.published_on,
    request.body.body
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
  // This deletes one article from the table, delete a record from CRUD, and deleteRecord in article.js

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
  // This deletes all articles in the table, delete all records in CRUD, and truncateTable in article.js

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
// This calls the loadDB function which puts the articles on the screen.
loadDB();

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}!`);
});


//////// ** DATABASE LOADER ** ////////
////////////////////////////////////////
function loadArticles() {
  // COMMENTED: What number(s) of the full-stack-diagram.png image correspond to the following line of code? Which method of article.js is interacting with this particular piece of `server.js`? What part of CRUD is being enacted/managed by this particular piece of code?
  // Number 4, it gets the articles and loads them into the server.

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
  // Number 3 it checks to see if a table exists, if not it creates one and then starts the loadArticles function.
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