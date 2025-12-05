/*
 * Complete this script so that it is able to add a superuser to the database
 * Usage example:
 *   node prisma/createsu.js clive123 clive.su@mail.utoronto.ca SuperUser123!
 */
'use strict';

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const prisma = new PrismaClient();

async function main() {
    const args = process.argv;

    if (args.length != 5) {
        return new Promise((resolve, reject) => {
            reject(new Error("Usage: createsu.js <utorid> <email> <password>"));
        });
    }

    const utorid = args[2];
    const email = args[3];
    const password = args[4];

    if (utorid.length < 7 || utorid.length > 8) {
        return new Promise((resolve, reject) => {
            reject(new Error("Usage: <utorid> must be 7-8 characters long"));
        });
    }

    await prisma.user.create({
        data: {
            utorid: utorid,
            email: email,
            password: password,
            verified: true,
            activated: true,
            role: 'superuser',
        }
    })

}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

