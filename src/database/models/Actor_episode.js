module.exports = (sequelize, dataTypes) => {
    let alias = 'Actor_episode';
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
        episode_id: {
            type: dataTypes.INTEGER.UNSIGNED
        },
    };
    let config = {
        tableName : "actor_episode",
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        deletedAt: false
    }
    const Actor_episode = sequelize.define(alias, cols, config);

    return Actor_episode
};