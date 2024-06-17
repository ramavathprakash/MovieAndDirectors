const express = require('express')
const path = require('path')

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

const app = express()
app.use(express.json())
const dbPath = path.join(__dirname, 'moviesData.db')

let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Starting Server At http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DE Error: ${e.message}`)
    process.exit(1)
  }
}

initializeDBAndServer()

//API 1 GET movie name

app.get('/movies/', async (request, response) => {
  const getMoviesList = `
        SELECT movie_name
        FROM movie;
    `
  const dbResponse = await db.all(getMoviesList)
  response.send(
    dbResponse.map(eachMovie => ({movieName: eachMovie.movie_name})),
  )
})

//API 2 CREATE Movie name
app.post('/movies/', async (request, response) => {
  const {directorId, movieName, leadActor} = request.body
  const createMovie = `
    INSERT INTO movie(director_id, movie_name, lead_actor)
    VALUES (
      ${directorId},
      '${movieName}',
      '${leadActor}'
    );
  `

  const dbResponse = await db.run(createMovie)

  response.send('Movie Successfully Added')
})

//API 3 GET Movie

app.get('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const getMovie = `
      SELECT *
      FROM movie
      WHERE 
      movie_id = ${movieId};
    `

  const dbResponse = await db.get(getMovie)
  const camelCase = {
    movieId: dbResponse.movie_id,
    directorId: dbResponse.director_id,
    movieName: dbResponse.movie_name,
    leadActor: dbResponse.lead_actor,
  }
  response.send(camelCase)
})

//API 4 UPDATE movie

app.put('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const {directorId, movieName, leadActor} = request.body
  const updateMovieDetails = `
    UPDATE movie
    SET 
      director_id = ${directorId},
      movie_name = '${movieName}',
      lead_actor = '${leadActor}'
    WHERE 
    movie_id = ${movieId};
  `
  await db.run(updateMovieDetails)
  response.send('Movie Details Updated')
})

//API 5 DELETE movie

app.delete('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const deleteMovie = `
    DELETE FROM 
      movie
    WHERE 
      movie_id = ${movieId};
  `
  await db.run(deleteMovie)
  response.send('Movie Removed')
})

//API 6 GET Directors

app.get('/directors/', async (request, response) => {
  const getDirectorsList = `
        SELECT *
        FROM director;
    `
  const dbResponse = await db.all(getDirectorsList)
  response.send(
    dbResponse.map(eachDirector => ({
      directorId: eachDirector.director_id,
      directorName: eachDirector.director_name,
    })),
  )
})

//API 7 GET Director Movies
app.get('/directors/:directorId/movies', async (request, response) => {
  const {directorId} = request.params
  const getDirectorMovie = `
    SELECT movie_name
    FROM movie
    WHERE director_id = ${directorId};
  `
  const dbResponse = await db.all(getDirectorMovie)
  response.send(
    dbResponse.map(eachMovieName => ({
      movieName: eachMovieName.movie_name,
    })),
  )
})
module.exports = app
