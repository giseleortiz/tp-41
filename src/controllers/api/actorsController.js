const path = require('path');
const db = require('../../database/models');
const sequelize = db.sequelize;
const { Op } = require("sequelize");
const moment = require('moment');
const createError = require("http-errors");


//Aqui tienen otra forma de llamar a cada uno de los modelos
const Movies = db.Movie;
const Genres = db.Genre;
const Actors = db.Actor;

const modelActor = {
    attributes: {
        exclude: ['favorite_movie_id', 'created_at', 'updated_at']
    },
    include: [
        {
            association: "movies",
            attributes: ["title", "rating"]
        }
    ]
}


const moviesController = {
    list: async (req, res) => {

        try {

            /* const errorDePrueba = new Error("Yo les dije y no me hicieron caso")
            errorDePrueba.status = 502
  
            throw errorDePrueba */

            const actors = await Actors.findAll(modelActor)

            const MoviesUrl = actors.map(movie => {
                return {
                    ...actors.dataValues,
                    URL: `${req.protocol}://${req.get("host")}/api/movies`
                }
            })

            return res.status(200).json({
                ok: true,
                meta: {
                    status: 200,
                    total: actors.length,
                    url: `${req.protocol}://${req.get("host")}/api/actors`
                },
                data: actors
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

            const actor = await Actors.findByPk(req.params.id, modelActor);

            if (!actor) throw createError(404, "no se encuentra el actor")

            return res.status(200).json({
                ok: true,
                meta: {
                    status: 200,
                    url: `${req.protocol}://${req.get("host")}/api/actors/${actor.id}`
                },
                data: actor
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
            const actors = await Actors.findAll({
                where: {
                    rating: { [db.Sequelize.Op.gte]: 8 }
                },
                order: [
                    ['rating', 'DESC']
                ],
                ...modelActor
            })

            return res.status(200).json({
                ok: true,
                meta: {
                    status: 200,
                    total: actors.length,
                    url: `${req.protocol}://${req.get("host")}/api/actors/recommended`
                },
                data: actors
            })

        } catch (error) {
            return res.status(error.status || 500).json({
                ok: false,
                msg: error.message || "Llamar a Eric"
            })
        }
    },

    //Aqui dispongo las rutas para trabajar con el CRUD
    create: async function (req, res) {

        try {

            const { first_name, last_name, rating, favorite_movie_id } = req.body

            if ([first_name, last_name, rating, favorite_movie_id].includes(" " || undefined)) throw createError(400, "Todos los campos son obligatorios")


            const newActor = await Actors.create(
                {
                    first_name: first_name.trim(),
                    last_name: last_name.trim(),
                    rating,
                    favorite_movie_id
                }
            )

            const actor = await Actors.findByPk(newActor.id, modelActor)

            return res.status(200).json({
                ok: true,
                meta: {
                    status: 200,
                    url: `${req.protocol}://${req.get("host")}/api/actors/${newActor.id}`
                },
                data: actor
            })

        } catch (error) {
            return res.status(error.status || 500).json({
                ok: false,
                msg: error.message || "Llamar a Eric"
            })
        }
    },

    update: async function (req, res) {
        let actorId = req.params.id;

        try {
            const { first_name, last_name, rating, favorite_movie_id } = req.body

            if (isNaN(req.params.id)) throw createError(404, "no se encuentra la pelicula")
            if ([first_name, last_name, rating, favorite_movie_id].includes("" || undefined)) throw createError(400, "Todos los campos son obligatorios")

            const actor = await Actors.findByPk(actorId, modelActor);

            if (!actor) throw createError(404, "no se encuentra la pelicula")

            actor.first_name = first_name?.trim() || actor.first_name;
            actor.last_name = last_name?.trim() || actor.last_name;
            actor.rating = rating || actor.rating;
            actor.favorite_movie_id = favorite_movie_id || actor.favorite_movie_id;

            actor.save();

            return res.status(200).json({
                ok: true,
                meta: {
                    status: 200,
                    url: `${req.protocol}://${req.get("host")}/api/actors/${actor.id}`
                },
                data: actor
            })

        } catch (error) {
            return res.status(error.status || 500).json({
                ok: false,
                msg: error.message || "Llamar a Eric"
            })
        }



    },
    destroy: async function (req, res) {
        let actorId = req.params.id;

        try {

            await db.Actor_movie.update(
                {actor_id : null},
                {where : {actor_id : actorId}})

            await db.Actor_episode.update(
                {actor_id : null},
                {where : {actor_id : actorId}})

            const actor = await Actors.destroy({ where: { id: actorId }, force: true }) // force: true es para asegurar que se ejecute la acción
            
            return res.status(200).json({
                ok: true,
                meta: {
                    status: 200,
                    url: `${req.protocol}://${req.get("host")}/api/actors/${actorId}`
                },
                data: actor
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