module.exports = (sequelize, dataTypes) => {
    let alias = 'Actor_movie';
    let cols = {
        id: {
            type: dataTypes.BIGINT(10).UNSIGNED,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
        },
        actor_id: {
            type: dataTypes.INTEGER.UNSIGNED
        },
        movie_id: {
            type: dataTypes.INTEGER.UNSIGNED
        },
    };
    let config = {
        tableName : "actor_movie",
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        deletedAt: false
    }
    const Actor_Movie = sequelize.define(alias, cols, config);

    return Actor_Movie
};