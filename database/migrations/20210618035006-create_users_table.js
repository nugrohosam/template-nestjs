'use strict';

module.exports = {
    /**
     *
     * @param {import("sequelize").QueryInterface} queryInterface
     * @param {import("sequelize").DataTypes} sequelize
     */
    up: async (queryInterface, sequelize) => {
        queryInterface.createTable('users', {
            id: {
                type: sequelize.UUID,
                primaryKey: true,
                defaultValue: sequelize.UUIDV4,
                allowNull: false,
            },

            address: {
                type: sequelize.STRING,
                unique: true,
                allowNull: false,
            },

            username: {
                type: sequelize.STRING,
                allowNull: true,
            },

            firstname: {
                type: sequelize.STRING,
                allowNull: true,
            },

            lastname: {
                type: sequelize.STRING,
                allowNull: true,
            },

            image_url: {
                type: sequelize.TEXT,
                allowNull: true,
            },

            location: {
                type: sequelize.STRING,
                allowNull: true,
            },

            email: {
                type: sequelize.STRING,
                allowNull: true,
            },

            about: {
                type: sequelize.TEXT,
                allowNull: true,
            },

            website: {
                type: sequelize.STRING,
                allowNull: true,
            },

            created_at: {
                type: sequelize.DATE,
                allowNull: true,
                defaultValue: sequelize.NOW,
            },

            updated_at: {
                type: sequelize.DATE,
                allowNull: true,
                defaultValue: sequelize.NOW,
            },

            deleted_at: {
                type: sequelize.DATE,
                allowNull: true,
            },
        });
    },

    /**
     *
     * @param {import("sequelize").QueryInterface} queryInterface
     */
    down: async (queryInterface) => {
        queryInterface.dropTable('users');
    },
};
