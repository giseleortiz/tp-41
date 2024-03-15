const path = require('path');
const db = require('../../database/models');
const sequelize = db.sequelize;
const { Op } = require("sequelize");
const moment = require('moment');
const createError = require("http-errors")


//Aqui tienen otra forma de llamar a cada uno de los modelos
const Movies = db.Movie;
const Genres = db.Genre;
const Actors = db.Actor;

const modelMovie = {
    attributes: {
        exclude: ['genre_id', 'created_at', 'updated_at']
    },
    include: [
        {
            association: "genre",
            attributes: ["name", "ranking"]
        }
    ]
}


const moviesController = {
    list: async (req, res) => {

        try {

            /* const errorDePrueba = new Error("Yo les dije y no me hicieron caso")
            errorDePrueba.status = 502
  
            throw errorDePrueba */

            const movies = await db.Movie.findAll(modelMovie)

            const MoviesUrl = movies.map(movie => {
                return {
                    ...movie.dataValues,
                    URL: `${req.protocol}://${req.get("host")}/api/movies`
                }
            })

            return res.status(200).json({
                ok: true,
                meta: {
                    status: 200,
                    total: movies.length,
                    url: `${req.protocol}://${req.get("host")}/api/movies`
                },
                data: movies
            })
        } catch (error) {
            return res.status(error.status || 500).json({
                ok: false,
                msg: error.message || "Llamar a Eric"
            })
        }
    },

    detail: async (req, res) => {

        try {

            if (isNaN(req.params.id)) throw createError(404, "Id incorrecto")

            const movie = await db.Movie.findByPk(req.params.id, modelMovie);

            if (!movie) throw createError(404, "no se encuentra la pelicula")

            return res.status(200).json({
                ok: true,
                meta: {
                    status: 200,
                    url: `${req.protocol}://${req.get("host")}/api/movies/${movie.id}`
                },
                data: movie
            })

        } catch (error) {
            return res.status(error.status || 500).json({
                ok: false,
                msg: error.message || "Llamar a Eric"
            })
        }
    },
    newest: async (req, res) => {

        try {
            const movies = await db.Movie.findAll({
                order: [
                    ['release_date', 'DESC']
                ],
                limit: 5,
                ...modelMovie
            })

            return res.status(200).json({
                ok: true,
                meta: {
                    status: 200,
                    total: movies.length,
                    url: `${req.protocol}://${req.get("host")}/api/movies/new`
                },
                data: movies
            })

        } catch (error) {
            return res.status(error.status || 500).json({
                ok: false,
                msg: error.message || "Llamar a Eric"
            })
        }
    },

    recomended: async (req, res) => {

        try {
            const movies = await db.Movie.findAll({
                where: {
                    rating: { [db.Sequelize.Op.gte]: 8 }
                },
                order: [
                    ['rating', 'DESC']
                ],
                ...modelMovie
            })

            return res.status(200).json({
                ok: true,
                meta: {
                    status: 200,
                    total: movies.length,
                    url: `${req.protocol}://${req.get("host")}/api/movies/recommended`
                },
                data: movies
            })

        } catch (error) {
            return res.status(error.status || 500).json({
                ok: false,
                msg: error.message || "Llamar a Eric"
            })
        }
    },

    //Aqui dispongo las rutas para trabajar con el CRUD
    add: function (req, res) {
        let promGenres = Genres.findAll();
        let promActors = Actors.findAll();

        Promise
            .all([promGenres, promActors])
            .then(([allGenres, allActors]) => {
                return res.render(path.resolve(__dirname, '..', 'views', 'moviesAdd'), { allGenres, allActors })
            })
            .catch(error => res.send(error))
    },
    create: async function (req, res) {

        try {

            const { title, length, rating, awards, release_date, genre_id } = req.body

            if ([title, rating, awards, release_date, genre_id, length].includes(" " || undefined)) throw createError(400, "Todos los campos son obligatorios")


            const newMovie = await Movies.create(
                {
                    title: req.body.title,
                    rating: req.body.rating,
                    awards: req.body.awards,
                    release_date: req.body.release_date,
                    length: req.body.length,
                    genre_id: req.body.genre_id
                }
            )

            const movie = await Movies.findByPk(newMovie.id, modelMovie)

            return res.status(200).json({
                ok: true,
                meta: {
                    status: 200,
                    total: movie.length,
                    url: `${req.protocol}://${req.get("host")}/api/movies/${newMovie.id}`
                },
                data: movie
            })

        } catch (error) {
            return res.status(error.status || 500).json({
                ok: false,
                msg: error.message || "Llamar a Eric"
            })
        }
    },

    update: async function (req, res) {
        let movieId = req.params.id;

        try {
            const { title, length, rating, awards, release_date, genre_id } = req.body

            if (isNaN(req.params.id)) throw createError(404, "no se encuentra la pelicula")
            if ([title, rating, awards, release_date, genre_id, length].includes("" || undefined)) throw createError(400, "Todos los campos son obligatorios")

            const movie = await db.Movie.findByPk(movieId);

            if (!movie) throw createError(404, "no se encuentra la pelicula")

            movie.title = title?.trim() || movie.title;
            movie.awards = awards || movie.awards;
            movie.rating = rating || movie.rating;
            movie.length = length || movie.length;
            movie.release_date = release_date || movie.release_date;
            movie.genre_id = genre_id || movie.genre_id;

            movie.save();

            return res.status(200).json({
                ok: true,
                meta: {
                    status: 200,
                    url: `${req.protocol}://${req.get("host")}/api/movies/${movie.id}`
                },
                data: movie
            })

        } catch (error) {
            return res.status(error.status || 500).json({
                ok: false,
                msg: error.message || "Llamar a Eric"
            })
        }



    },
    destroy: async function (req, res) {
        let movieId = req.params.id;

        try {

            await Actors.update(
                {favorite_movie_id : null},
                {where : {favorite_movie_id : movieId}})

            await db.Actor_movie.destroy({ where: { movie_id: movieId }, force: true });

            const movies = await Movies.destroy({ where: { id: movieId }, force: true }) // force: true es para asegurar que se ejecute la acción
            
            return res.status(200).json({
                ok: true,
                meta: {
                    status: 200,
                    url: `${req.protocol}://${req.get("host")}/api/movies/${movieId}`
                },
                data: movies
            })
        } catch (error) {
            return res.status(error.status || 500).json({
                ok: false,
                msg: error.message || "Llamar a Eric"
            })
        }
    }
}

module.exports = moviesController;