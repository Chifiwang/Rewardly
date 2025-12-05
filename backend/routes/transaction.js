const { PrismaClient } = require('@prisma/client');
const express = require("express");

const prisma = new PrismaClient();
const router = express.Router();

const utils = require("../utils/misc");

router.post("/", async (req, res) => {
    const { utorid = null, type = null, ...rest } = req.body || {};

    if (!utorid || !type) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    const tokenHeader = req.headers.authorization;
    if (!tokenHeader) {
        return res.status(401).send({ error: "Not authorized" });
    }

    const parts = tokenHeader.split(" ");
    if (parts.length !== 2 || parts[0].toLowerCase() !== "bearer") {
      return res.status(401).send({ error: "Invalid authorization header" });
    }
    const token = parts[1];

    const data = utils.decodeJWToken(token);

    if (data.exp * 1000 < Date.now()) {
        return res.status(401).send({ error: "Expired token" });
    }

    const authUser = await prisma.user.findUnique({
        where: { utorid: data.utorid }
    });

    if (!authUser) {
        return res.status(401).send({ error: "User not found" });
    }

    if (type === "purchase") {
        const { spent = null, promotionIds = [], remark = null } = rest;

        if (spent === null) {
            return res.status(400).json({ error: "Missing required fields for purchase" });
        }

        if (spent <= 0) {
            return res.status(400).json({ error: "Spent must be a positive value" });
        }

        if (authUser.role === 'regular') {
            return res.status(403).send({ error: "Action not permitted" });
        }

        const user = await prisma.user.findUnique({ where: { utorid: utorid } });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Validate Promotions
        let validPromotionIds = [];
        let totalEarned = Math.round(spent / 0.25); // Base points: 1 point per 25 cents

        if (promotionIds && promotionIds.length > 0) {
            const promotions = await prisma.promotion.findMany({
                where: {
                    id: { in: promotionIds },
                    startTime: { lte: new Date() },
                    endTime: { gte: new Date() }
                }
            });

            // Check if all provided promotion IDs are valid and active
            if (promotions.length !== promotionIds.length) {
                return res.status(400).json({ error: "Invalid promotion IDs" });
            }

            // Validate each promotion
            for (const promo of promotions) {
                // Check min spending
                if (promo.minSpending !== null && spent < promo.minSpending) {
                    return res.status(400).json({ error: "Promotion min spending not met" });
                }

                if (promo.type === 'onetime') {
                    const existingUsage = await prisma.transaction.findFirst({
                        where: {
                            promotionIds: {
                                some: { id: promo.id }
                            }
                        }
                    });
                    if (existingUsage) {
                        return res.status(400).json({ error: "One-time promotion already used" });
                    }
                }

                if (promo.rate) {
                    totalEarned += Math.floor(spent * promo.rate);
                }
                if (promo.points) {
                    totalEarned += promo.points;
                }

                validPromotionIds.push(promo.id);
            }
        }
        // === ADD DEBUG STATEMENTS HERE ===
        console.log('=== DEBUG PURCHASE SUSPICIOUS ===');
        console.log('Cashier utorid:', authUser.utorid);
        console.log('Cashier suspicious status:', authUser.suspicious);
        console.log('Spent amount:', spent);
        console.log('Base points calculation:', Math.round(spent / 0.25));
        console.log('Promotion IDs applied:', promotionIds);
        let earned = authUser.suspicious ? 0 : totalEarned;
        console.log('Final earned points:', earned);
        console.log('=== END DEBUG ===');
        // === END DEBUG STATEMENTS ===

        const newTransaction = await prisma.transaction.create({
            data: {
                utorid: utorid,
                type: "purchase",
                spent: spent,
                earned: earned,
                amount: earned,
                remark: remark ? remark : "",
                createdBy: authUser.utorid,
                promotionIds: {
                    connect: validPromotionIds.map(id => ({ id: id }))
                }
            },
            include: {
                promotionIds: {
                    select: { id: true }
                }
            }
        });

        // Format response correctly according to spec
        const response = {
            id: newTransaction.id,
            utorid: newTransaction.utorid,
            type: newTransaction.type,
            spent: newTransaction.spent,
            earned: newTransaction.earned,
            remark: newTransaction.remark,
            promotionIds: newTransaction.promotionIds.map(p => p.id),
            createdBy: newTransaction.createdBy
        };

        if (!authUser.suspicious) {
            await prisma.user.update({
                where: { utorid: utorid },
                data: {
                    points: {
                        increment: earned
                    }
                }
            });
        }

        return res.status(201).json(response);

    } else if (type === "adjustment") {
        const { amount = null, relatedId = null, remark = null } = rest;

        if (amount === null || relatedId === null) {
            return res.status(400).json({ error: "Missing required fields for adjustment" });
        }

        if (authUser.role !== 'manager' && authUser.role !== 'superuser') {
            return res.status(403).send({ error: "Action not permitted" });
        }

        const user = await prisma.user.findUnique({ where: { utorid: utorid } });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const relatedTransaction = await prisma.transaction.findUnique({ where: { id: relatedId } });
        if (!relatedTransaction) {
            return res.status(404).json({ error: "Related transaction not found" });
        }

        const newTransaction = await prisma.transaction.create({
            data: {
                utorid: utorid,
                type: "adjustment",
                amount: amount,
                relatedId: relatedId,
                remark: remark ? remark : "",
                createdBy: authUser.utorid
            }
        });

        // Format adjustment response according to spec
        const response = {
            id: newTransaction.id,
            utorid: newTransaction.utorid,
            amount: newTransaction.amount,
            type: newTransaction.type,
            relatedId: newTransaction.relatedId,
            remark: newTransaction.remark,
            promotionIds: [], // Adjustments don't have promotions
            createdBy: newTransaction.createdBy
        };

        await prisma.user.update({
            where: { utorid: utorid },
            data: {
                points: {
                    increment: amount
                }
            }
        });

        return res.status(201).json(response);
    } else {
        return res.status(400).json({ error: "Invalid transaction type" });
    }
});

router.patch("/:transactionId/suspicious", async (req, res) => {
    const tokenHeader = req.headers.authorization;
    if (!tokenHeader) {
        return res.status(401).send({ error: "Not authorized" });
    }

    const parts = tokenHeader.split(" ");
    if (parts.length !== 2 || parts[0].toLowerCase() !== "bearer") {
      return res.status(401).send({ error: "Invalid authorization header" });
    }
    const token = parts[1];

    const data = utils.decodeJWToken(token);

    if (data.exp * 1000 < Date.now()) {
        return res.status(401).send({ error: "Expired token" });
    }

    const authUser = await prisma.user.findUnique({
        where: { utorid: data.utorid }
    });

    if (!authUser) {
        return res.status(401).send({ error: "User not found" });
    }

    if (authUser.role !== 'manager' && authUser.role !== 'superuser') {
        return res.status(403).send({ error: "Action not permitted" });
    }

    const transactionId = Number(req.params.transactionId);
    const { suspicious } = req.body;

    if (suspicious === undefined) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    const transaction = await prisma.transaction.findUnique({
        where: { id: transactionId }
    });

    if (!transaction) {
        return res.status(404).send({ error: "Transaction not found" });
    }

    if (transaction.suspicious === suspicious) {
        return res.status(400).json({ error: `Transaction is already marked as ${suspicious ? 'suspicious' : 'not suspicious'}` });
    }

    const updatedTransaction = await prisma.transaction.update({
        where: { id: transactionId },
        data: { suspicious: suspicious },
        include: {
            promotionIds: {
                select: { id: true }
            }
        }
    });

if (transaction.type === 'purchase') {
    if (suspicious) {
        await prisma.user.update({
            where: { utorid: transaction.utorid },
            data: {
                points: {
                    decrement: transaction.earned
                }
            }
        });
    } else {
        await prisma.user.update({
            where: { utorid: transaction.utorid },
            data: {
                points: {
                    increment: transaction.earned
                }
            }
        });
    }
}

// Format response with promotionIds
const response = {
    ...updatedTransaction,
    promotionIds: updatedTransaction.promotionIds.map(p => p.id)
};

res.status(200).json(response);
});

// Generic update (currently allows remark only) for manager/superuser
router.patch("/:transactionId", async (req, res) => {
    const tokenHeader = req.headers.authorization;
    if (!tokenHeader) return res.status(401).send({ error: "Not authorized" });

    const parts = tokenHeader.split(" ");
    if (parts.length !== 2 || parts[0].toLowerCase() !== "bearer") {
      return res.status(401).send({ error: "Invalid authorization header" });
    }
    const token = parts[1];
    const data = utils.decodeJWToken(token);
    if (data.exp * 1000 < Date.now()) return res.status(401).send({ error: "Expired token" });

    const authUser = await prisma.user.findUnique({ where: { utorid: data.utorid } });
    if (!authUser) return res.status(401).send({ error: "User not found" });
    if (authUser.role !== 'manager' && authUser.role !== 'superuser') {
        return res.status(403).send({ error: "Action not permitted" });
    }

    const transactionId = Number(req.params.transactionId);
    if (isNaN(transactionId)) return res.status(400).send({ error: "Invalid transactionId" });

    const { remark } = req.body || {};
    if (remark !== undefined && typeof remark !== "string") {
        return res.status(400).send({ error: "Invalid remark" });
    }

    try {
        const updated = await prisma.transaction.update({
            where: { id: transactionId },
            data: { remark: remark ?? undefined },
            include: { promotionIds: { select: { id: true } } }
        });
        return res.status(200).send({
            ...updated,
            promotionIds: updated.promotionIds.map(p => p.id)
        });
    } catch (e) {
        if (e.code === 'P2025') return res.status(404).send({ error: "Transaction not found" });
        return res.status(500).send({ error: "Internal server error" });
    }
});

router.delete("/:transactionId", async (req, res) => {
    const tokenHeader = req.headers.authorization;
    if (!tokenHeader) return res.status(401).send({ error: "Not authorized" });

    const parts = tokenHeader.split(" ");
    if (parts.length !== 2 || parts[0].toLowerCase() !== "bearer") {
      return res.status(401).send({ error: "Invalid authorization header" });
    }
    const token = parts[1];
    const data = utils.decodeJWToken(token);
    if (data.exp * 1000 < Date.now()) return res.status(401).send({ error: "Expired token" });

    const authUser = await prisma.user.findUnique({ where: { utorid: data.utorid } });
    if (!authUser) return res.status(401).send({ error: "User not found" });
    if (authUser.role !== 'manager' && authUser.role !== 'superuser') {
        return res.status(403).send({ error: "Action not permitted" });
    }

    const transactionId = Number(req.params.transactionId);
    if (isNaN(transactionId)) return res.status(400).send({ error: "Invalid transactionId" });

    try {
        await prisma.transaction.delete({ where: { id: transactionId } });
        return res.status(204).send();
    } catch (e) {
        if (e.code === 'P2025') return res.status(404).send({ error: "Transaction not found" });
        return res.status(500).send({ error: "Internal server error" });
    }
});

router.patch("/:transactionId/processed", async (req, res) => {
    const tokenHeader = req.headers.authorization;
    if (!tokenHeader) {
        return res.status(401).send({ error: "Not authorized" });
    }

    const parts = tokenHeader.split(" ");
    if (parts.length !== 2 || parts[0].toLowerCase() !== "bearer") {
      return res.status(401).send({ error: "Invalid authorization header" });
    }
    const token = parts[1];

    const data = utils.decodeJWToken(token);

    if (data.exp * 1000 < Date.now()) {
        return res.status(401).send({ error: "Expired token" });
    }

    const authUser = await prisma.user.findUnique({
        where: { utorid: data.utorid }
    });

    if (!authUser) {
        return res.status(401).send({ error: "User not found" });
    }

    if (authUser.role === 'regular') {
        return res.status(403).send({ error: "Action not permitted" });
    }

    const transactionId = Number(req.params.transactionId);
    const { processed } = req.body;

    if (processed === undefined) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    if (processed !== true) {
        return res.status(400).json({ error: "Can only mark a transaction as processed" });
    }

    const transaction = await prisma.transaction.findUnique({
        where: { id: transactionId }
    });

    if (!transaction) {
        return res.status(404).send({ error: "Transaction not found" });
    }

    if (transaction.type !== 'redemption') {
        return res.status(400).json({ error: "Transaction is not a redemption" });
    }

    if (transaction.processedBy) {
        return res.status(400).json({ error: "Transaction has already been processed" });
    }

    const updatedTransaction = await prisma.transaction.update({
        where: { id: transactionId },
        data: { processedBy: authUser.utorid }
    });

    await prisma.user.update({
        where: { utorid: transaction.utorid },
        data: {
            points: {
                decrement: transaction.redeemed
            }
        }
    });

    res.status(200).json(updatedTransaction);
});

module.exports = router;

router.get("/", async (req, res) => {
    const tokenHeader = req.headers.authorization;
    if (!tokenHeader) {
        return res.status(401).send({ error: "Not authorized" });
    }

    const parts = tokenHeader.split(" ");
    if (parts.length !== 2 || parts[0].toLowerCase() !== "bearer") {
      return res.status(401).send({ error: "Invalid authorization header" });
    }
    const token = parts[1];

    const data = utils.decodeJWToken(token);

    if (data.exp * 1000 < Date.now()) {
        return res.status(401).send({ error: "Expired token" });
    }

    const authUser = await prisma.user.findUnique({
        where: { utorid: data.utorid }
    });

    if (!authUser) {
        return res.status(401).send({ error: "User not found" });
    }

    let {
        name = null,
        createdBy = null,
        suspicious = null,
        promotionId = null,
        type = null,
        relatedId = null,
        amount = null,
        operator = null,
        page = 1,
        limit = 10
    } = req.query;

    page = Number(page);
    limit = Number(limit);

    if (Number.isNaN(page) || Number.isNaN(limit)
        || page < 1 || limit < 1) {
        return res.status(400).send({ error: "Invalid pagination" });
    }

    suspicious = suspicious === 'true' ? true : suspicious === 'false' ? false : null;

    const filters = (Object.entries({
        name: name,
        createdBy: createdBy,
        suspicious: suspicious,
        type: type,
        relatedId: relatedId ? Number(relatedId) : null,
    })).reduce((acc, e) => { if (e[1] != null) { acc[e[0]] = e[1]; } return acc; }, {});

    // Regular/cashier only see their own transactions
    if (authUser.role === 'regular' || authUser.role === 'cashier') {
        filters.utorid = authUser.utorid;
    }

    if (promotionId) {
        filters.promotionIds = {
            some: { id: Number(promotionId) }
        };
    }

    if (amount) {
        if (operator === 'gte') {
            filters.amount = { gte: Number(amount) };
        } else if (operator === 'lte') {
            filters.amount = { lte: Number(amount) };
        } else {
            return res.status(400).send({ error: "Invalid operator" });
        }
    }

    const count = await prisma.transaction.count({ where: filters });

    const transactions = await prisma.transaction.findMany({
        where: filters,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { id: 'desc' },
        include: {
            promotionIds: {
                select: { id: true }
            }
        }
    });

    // Format transactions with promotionIds array
    const formattedTransactions = transactions.map(tx => ({
        ...tx,
        promotionIds: tx.promotionIds.map(p => p.id)
    }));

    return res.status(200).send({ count: count, results: formattedTransactions });
});

router.get("/:transactionId", async (req, res) => {
    const tokenHeader = req.headers.authorization;
    if (!tokenHeader) {
        return res.status(401).send({ error: "Not authorized" });
    }

    const parts = tokenHeader.split(" ");
    if (parts.length !== 2 || parts[0].toLowerCase() !== "bearer") {
      return res.status(401).send({ error: "Invalid authorization header" });
    }
    const token = parts[1];

    const data = utils.decodeJWToken(token);

    if (data.exp * 1000 < Date.now()) {
        return res.status(401).send({ error: "Expired token" });
    }

    const authUser = await prisma.user.findUnique({
        where: { utorid: data.utorid }
    });

    if (!authUser) {
        return res.status(401).send({ error: "User not found" });
    }

    if (authUser.role !== 'manager' && authUser.role !== 'superuser') {
        return res.status(403).send({ error: "Action not permitted" });
    }

    const transactionId = Number(req.params.transactionId);

    const transaction = await prisma.transaction.findUnique({
        where: { id: transactionId },
        include: {
            promotionIds: {
                select: { id: true }
            }
        }
    });

    if (!transaction) {
        return res.status(404).send({ error: `Transaction ${transactionId} not found` });
    }

    // Format with promotionIds array
    let response = {
        ...transaction,
        promotionIds: transaction.promotionIds.map(p => p.id)
    };

    // For purchase transactions, ensure amount reflects earned points (not total calculated)
    if (transaction.type === 'purchase') {
        response.amount = transaction.earned; // This should be 0, not 60
    }

    return res.status(200).send(response);
});
