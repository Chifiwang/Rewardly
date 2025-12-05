const { PrismaClient } = require('@prisma/client');
const express = require("express");

const prisma = new PrismaClient();
const router = express.Router();

const utils = require("../utils/misc");
const crypto = require("crypto");

let resetLimited = new Set();

router.post("/tokens", async (req, res) => {
    const { utorid = null, password = null, ...rest } = req.body || {};
    if (!utorid || !password || Object.keys(rest).length !== 0) {
        return res.status(400).send({ error: "Usage: { <utorid>, <password> }" });
    }

    const user = await prisma.user.findUnique({
        where: { utorid: utorid, password: password },
    });

    if (!user || Object.keys(user).length === 0) {
        return res.status(401).send({ error: "Cannot log in"});
    }

    const token = utils.generateJWToken({
        utorid: user.utorid,
        role: user.role
    }, '1h');

    await prisma.user.update({
        where: { utorid: user.utorid },
        data: {
            expiresAt: token.expiresAt,
            lastLogin: new Date(Date.now()),
        }
    })

    res.send(token);
});

router.post("/resets", async (req, res) => {
    const { utorid = null, password = null, ...rest } = req.body || {};
    if (!utorid || !password || Object.keys(rest).length !== 0) {
        return res.status(400).send({ error: "Usage: { <utorid>, <password> }" });
    }

    const user = await prisma.user.findFirst({
        where: { utorid: utorid },
    });

    if (!user || Object.keys(user).length == 0) {
        return res.status(404).send({ error: "Could not find user"});
    }

    if (password.length < 6) {
        return res.status(400).send({ error: "Invalid password (min 6 chars)" });
    }

    await prisma.user.update({
        where: { utorid: utorid },
        data: { password: password,
                resetToken: null,
                expiresAt: null}
    });

    return res.send({ message: "Password updated" });
});

router.all("/tokens", (req, res) => res.status(405).send({ error: "Method not allowed" }))
router.all("/resets", (req, res) => res.status(405).send({ error: "Method not allowed" }))
router.all("/resets/:resetToken", (req, res) => res.status(405).send({ error: "Method not allowed" }))

module.exports = router;
