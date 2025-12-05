const { PrismaClient } = require('@prisma/client');
const express = require("express");
// const multer = require("multer");

const prisma = new PrismaClient();
const router = express.Router();

const utils = require("../utils/misc");

router.post("/", async (req, res) => {
    const name = req.body.name;
    if (!name) return res.status(400).send({ error: "No name" });
    const description = req.body.description;
    if (!description) return res.status(400).send({ error: "No description" });
    const type = req.body.type;
    if (!type || (type !== 'automatic' && type !== 'one-time')) return res.status(400).send({ error: "No type" });
    const startTime = req.body.startTime;
    if (!startTime || !utils.isISODate(startTime)) return res.status(400).send({ error: "No startTime" });
    const endTime = req.body.endTime;
    if (!endTime || !utils.isISODate(endTime)) return res.status(400).send({ error: "No endTime" });
    if (startTime < Date.now() || startTime > endTime) return res.status(400).send({ error: "Bad time" });

    let minSpending = -1;
    if (req.body.minSpending !== undefined) {
        minSpending = Number(req.body.minSpending);
        if (isNaN(minSpending) || minSpending < 0) return res.status(400).send({ error: "minSpending is a Number" });
    } else {
         minSpending = null;
    }

    let rate = -1;
    if (req.body.rate !== undefined) {
        rate = Number(req.body.rate);
        if (isNaN(rate) || rate < 0) return res.status(400).send({ error: "rate is a Number" });
    } else {
        rate = null;
    }

    let points = -1;
    if (req.body.points !== undefined) {
        points = Number(req.body.points);
        if (isNaN(points) || points < 0) return res.status(400).send({ error: "rate is a Number" });
    } else {
        points = null;
    }

    // Authentication
    const tokenHeader = req.headers.authorization;
    if (!tokenHeader) return res.status(401).send({ error: "Not authorized" });

    const parts = tokenHeader.split(" ");
    if (parts.length !== 2 || parts[0].toLowerCase() !== "bearer") {
        return res.status(401).send({ error: "Invalid authorization header" });
    }

    const token = parts[1];
    const data = utils.decodeJWToken(token);
    if (!data || !data.utorid) return res.status(401).send({ error: "Invalid token" });

    const authUser = await prisma.user.findUnique({ where: { utorid: data.utorid } });
    if (!authUser) return res.status(401).send({ error: "User not found" });

    if (authUser.role === 'regular' || authUser.role === 'cashier') {
        return res.status(403).send({ error: "Not allowed" });
    }

    try {
        const promotion = await prisma.promotion.create({
            data: {
                name: name,
                description: description,
                type: type === 'one-time' ? "onetime" : "automatic",
                startTime: startTime,
                endTime: endTime,
                minSpending: minSpending,
                rate: rate,
                points: points
            }
        })

        return res.status(201).send({...promotion, type: promotion.type === 'onetime' ? 'one-time' : 'automatic'});
    } catch (error) {
        console.error(error);
        return res.status(500).send({ error: "Internal server error" });
    }
});

router.get("/", async (req, res) => {
    let filter = {}
    const name = req.query.name;
    if (name) filter.name = name;

    const type = req.query.type;
    if (type && (type !== 'automatic' && type !== 'one-time')) return res.status(400).send({ error: "No type" });
    if (type) filter.type = type === 'one-time' ? "onetime" : "automatic";

    let page = 1;
    if (req.query.page !== undefined) {
        page = Number(req.query.page);
        if (isNaN(page) || page < 1) return res.status(400).send({ error: "page is a Number" });
    }

    let limit = 10;
    if (req.query.limit !== undefined) {
        limit = Number(req.query.limit);
        if (isNaN(limit) || limit < 1) return res.status(400).send({ error: "limit is a Number" });
    }

    let started = null;
    if (req.query.started !== undefined) {
        started = req.query.started;
        if (started !== 'false' && started !== 'true') return res.status(400).send({ error: "started is a boolean" });
        started = started === 'true';
        if (started) {
            filter.startTime =  { lt: new Date() };
            filter.endTime = { gt: new Date() };
        } else {
            filter.startTime = { gt: new Date() }
        }
    }

    let ended = null;
    if (req.query.ended !== undefined) {
        if (req.query.started !== undefined) return res.status(400).send({ error: "cant have both" });
        ended = req.query.ended;
        if (ended !== 'false' && ended !== 'true') return res.status(400).send({ error: "ended is a boolean" });
        ended = ended === 'true';
        if (ended) {
            filter.endTime =  {lt: new Date() }
        } else {
            filter.endTime = { gt: new Date() }
        }
    }

    // Authentication
    const tokenHeader = req.headers.authorization;
    if (!tokenHeader) return res.status(401).send({ error: "Not authorized" });

    const parts = tokenHeader.split(" ");
    if (parts.length !== 2 || parts[0].toLowerCase() !== "bearer") {
        return res.status(401).send({ error: "Invalid authorization header" });
    }

    const token = parts[1];
    const data = utils.decodeJWToken(token);
    if (!data || !data.utorid) return res.status(401).send({ error: "Invalid token" });

    const authUser = await prisma.user.findUnique({ where: { utorid: data.utorid } });
    if (!authUser) return res.status(401).send({ error: "User not found" });

    try {
        const count = await prisma.promotion.count({
            where: filter
        });

        let promos = await prisma.promotion.findMany({
            where: filter,
            take: limit,
            skip: (page - 1) * limit,
            include: { user: { select: { utorid: true } } }
        })

        promos = promos.map(e => {
            return {
                ...e,
                type: e.type === 'onetime' ? "one-time" : "automatic",
            }
        });

        return res.status(200).send({count: count, results: promos});
    } catch (error) {
        console.error(error);
        return res.status(500).send({ error: "Internal server error" });
    }
});

router.get("/:promotionId", async (req, res) => {
    const promoId = Number(req.params.promotionId);

    if (isNaN(promoId)) {
        return res.status(404).send({ error: "Invalid promotionId" });
    }

    // Authentication
    const tokenHeader = req.headers.authorization;
    if (!tokenHeader) return res.status(401).send({ error: "Not authorized" });

    const parts = tokenHeader.split(" ");
    if (parts.length !== 2 || parts[0].toLowerCase() !== "bearer") {
        return res.status(401).send({ error: "Invalid authorization header" });
    }

    const token = parts[1];
    const data = utils.decodeJWToken(token);
    if (!data || !data.utorid) return res.status(401).send({ error: "Invalid token" });

    const authUser = await prisma.user.findUnique({ where: { utorid: data.utorid } });
    if (!authUser) return res.status(401).send({ error: "User not found" });

    let promo = {};
    if (authUser.role === 'regular' || authUser.role === 'cashier') {
         promo = await prisma.promotion.findFirst({ where: { id: promoId, startTime: {lt: new Date()}, endTime: {gt: new Date()}},
        select: {
                id: true,
                name: true,
                description: true,
                type: true,
                startTime: true,
                endTime: true,
                minSpending: true,
                rate: true,
                points: true,
                user: { select: { utorid: true } }
            }});
    } else {
         promo = await prisma.promotion.findFirst({ where: { id: promoId },
            select: {
                    id: true,
                    name: true,
                    description: true,
                    type: true,
                    startTime: true,
                    endTime: true,
                    minSpending: true,
                    rate: true,
                    points: true,
                    user: { select: { utorid: true } }
            }});
    }





    if (!promo) {
        return res.status(404).send({ error: "Promotion not found." });
    }

    return res.status(200).send({...promo, type: promo.type === 'onetime'?'one-time':'automatic'});
});

// Apply a promotion to the current user
router.post("/:promotionId/apply", async (req, res) => {
    const promoId = Number(req.params.promotionId);
    if (isNaN(promoId)) return res.status(400).send({ error: "Invalid promotionId" });

    const tokenHeader = req.headers.authorization;
    if (!tokenHeader) return res.status(401).send({ error: "Not authorized" });
    const parts = tokenHeader.split(" ");
    if (parts.length !== 2 || parts[0].toLowerCase() !== "bearer") {
        return res.status(401).send({ error: "Invalid authorization header" });
    }
    const token = parts[1];
    const data = utils.decodeJWToken(token);
    if (!data || !data.utorid) return res.status(401).send({ error: "Invalid token" });

    const authUser = await prisma.user.findUnique({ where: { utorid: data.utorid } });
    if (!authUser) return res.status(401).send({ error: "User not found" });

    const promo = await prisma.promotion.findUnique({
        where: { id: promoId },
        include: { user: { select: { utorid: true } } }
    });
    if (!promo) return res.status(404).send({ error: "Promotion not found" });

    const already = promo.user.some(u => u.utorid === authUser.utorid);
    if (already) {
        return res.status(200).send({ ...promo, type: promo.type === 'onetime' ? "one-time" : "automatic" });
    }

    const updated = await prisma.promotion.update({
        where: { id: promoId },
        data: { user: { connect: { utorid: authUser.utorid } } },
        include: { user: { select: { utorid: true } } }
    });

    return res.status(200).send({ ...updated, type: updated.type === 'onetime' ? "one-time" : "automatic" });
});

router.patch("/:promotionId", async (req, res) => {
    const promoId = Number(req.params.promotionId);

    if (isNaN(promoId)) {
        return res.status(404).send({ error: "Invalid promotionId" });
    }

    // Authentication
    const tokenHeader = req.headers.authorization;
    if (!tokenHeader) return res.status(401).send({ error: "Not authorized" });

    const parts = tokenHeader.split(" ");
    if (parts.length !== 2 || parts[0].toLowerCase() !== "bearer") {
        return res.status(401).send({ error: "Invalid authorization header" });
    }

    const token = parts[1];
    const data = utils.decodeJWToken(token);
    if (!data || !data.utorid) return res.status(401).send({ error: "Invalid token" });

    const authUser = await prisma.user.findUnique({ where: { utorid: data.utorid } });
    if (!authUser) return res.status(401).send({ error: "User not found" });

    if (authUser.role === 'regular' || authUser.role === 'cashier') {
        return res.status(403).send({ error: "Not allowed" });
    }

    const promo = await prisma.promotion.findUnique({ where: {id: promoId }});
    if (!promo) return res.status(404).send({error : "cant find promotion"});

    let changes = {}

    const name = req.body.name;
    if (name) changes.name = name;
    const description = req.body.description;
    if (description) changes.description = description;
    const type = req.body.type;
    if (type && (type !== 'automatic' && type !== 'one-time')) return res.status(400).send({ error: "No type" });
    if (type) changes.type = type==='one-time'?'onetime':'automatic';
    const startTime = req.body.startTime;
    if (startTime && (!utils.isISODate(startTime) || new Date(startTime) < new Date())) return res.status(400).send({ error: "No startTime" });

    const endTime = req.body.endTime;
    if (endTime && (!utils.isISODate(endTime) || new Date(endTime) < new Date())) return res.status(400).send({ error: "No endTime" });
    if (new Date(endTime) < new Date(promo.startTime)) return res.status(400).send({ error: "cant end before start" + promo.startTime + " " + endTime});
    // if (startTime < Date.now() || startTime > endTime) return res.status(400).send({ error: "Bad time" });

    let minSpending = -1;
    if (req.body.minSpending) {
        minSpending = Number(req.body.minSpending);
        if (isNaN(minSpending) || minSpending < 0) return res.status(400).send({ error: "minSpending is a Number" });
        changes.minSpending = minSpending;
    } else {
         minSpending = null;
    }

    let rate = -1;
    if (req.body.rate) {
        rate = Number(req.body.rate);
        if (isNaN(rate) || rate < 0) return res.status(400).send({ error: "rate is a Number" });
        changes.rate = rate;
    } else {
        rate = null;
    }

    let points = -1;
    if (req.body.points) {
        points = Number(req.body.points);
        if (isNaN(points) || points < 0) return res.status(400).send({ error: "rate is a Number" });
        changes.points = points;
    } else {
        points = null;
    }

    try {
        const updatedPromo = await prisma.promotion.update({ where: {id: promoId},
            data: changes
        });

        return res.status(200).send(updatedPromo);
    } catch (error) {
        console.error(error);
        return res.status(500).send({ error: "Internal server error" });
    }

});

router.delete("/:promotionId", async (req, res) => {
    const promoId = Number(req.params.promotionId);

    if (isNaN(promoId)) {
        return res.status(404).send({ error: "Invalid promotionId" });
    }

    // Authentication
    const tokenHeader = req.headers.authorization;
    if (!tokenHeader) return res.status(401).send({ error: "Not authorized" });

    const parts = tokenHeader.split(" ");
    if (parts.length !== 2 || parts[0].toLowerCase() !== "bearer") {
        return res.status(401).send({ error: "Invalid authorization header" });
    }

    const token = parts[1];
    const data = utils.decodeJWToken(token);
    if (!data || !data.utorid) return res.status(401).send({ error: "Invalid token" });

    const authUser = await prisma.user.findUnique({ where: { utorid: data.utorid } });
    if (!authUser) return res.status(401).send({ error: "User not found" });

    if (authUser.role === 'regular' || authUser.role === 'cashier') {
        return res.status(403).send({ error: "Not allowed" });
    }

    const { password } = req.body || {};
    if (!password || authUser.password !== password) {
        return res.status(401).send({ error: "Invalid password" });
    }

    const promo = await prisma.promotion.findUnique({ where: {id: promoId }});
    if (!promo) return res.status(404).send({error : "cant find promotion"});

    try {
        await prisma.promotion.delete({ where: {id: promoId}});

        return res.status(204).send({ message: "Successfully deleted" });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ error: "Internal server error" });
    }

});

router.all("/", (req, res) => res.status(405).send({ error: "Invalid method" }));

module.exports = router;
