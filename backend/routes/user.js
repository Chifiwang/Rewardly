const { PrismaClient } = require('@prisma/client');
const express = require("express");
const multer = require("multer");
const path = require("path");

const prisma = new PrismaClient();
const router = express.Router();

const utils = require("../utils/misc");

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/avatars/'); // Create this directory
    },
    filename: function (req, file, cb) {
        // Use utorid as filename to ensure uniqueness
        const utorid = req.user?.utorid || 'unknown';
        const ext = path.extname(file.originalname);
        cb(null, `${utorid}${ext}`);
    }
});

// File filter for images only
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    }
});

router.get("/me", async (req, res) => {
    const tokenHeader = req.headers.authorization;
    if (!tokenHeader) return res.status(401).send({ error: "Not authorized" });

    const parts = tokenHeader.split(" ");
    if (parts.length !== 2 || parts[0].toLowerCase() !== "bearer") {
        return res.status(401).send({ error: "Invalid authorization header" });
    }
    const token = parts[1];
    const data = utils.decodeJWToken(token);
    if (!data || !data.utorid) return res.status(401).send({ error: "Invalid token payload" });
    if (data.exp * 1000 < Date.now()) return res.status(401).send({ error: "Expired token" });

    const authUser = await prisma.user.findUnique({
        where: { utorid: data.utorid },
        select: {
            id: true,
            utorid: true,
            name: true,
            email: true,
            birthday: true,
            role: true,
            points: true,
            createdAt: true,
            lastLogin: true,
            verified: true,
            avatarUrl: true
        }
    });

    if (!authUser) return res.status(401).send({ error: "User not found" });
    return res.status(200).send({ user: authUser });
});


router.post("/", async (req, res) => {
    const { utorid = null, name = null, email = null , password = null, ...rest } = req.body || {};
    if (!utorid || !name || !email || !password || Object.keys(rest).length != 0) {
        return res.status(400).send({ error: "Usage: { <utorid>, <name>, <email>, <password> }" });
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

    const data = utils.decodeJWToken(token)

    const authUser = await prisma.user.findUnique({
        where: { utorid: data.utorid }
    });

    if (!authUser) {
        return res.status(401).send({ error: "User not found" });
    }

    if (authUser.role === 'regular') {
        return res.status(403).send({ error: "Action not permitted" });
    }

    if (data.exp * 1000 < Date.now()) {
        return res.status(401).send({ error: "Expired token" });
    }

    if (utorid.length < 3 || utorid.length > 20) {
        return res.status(400).send({ error: "Invalid utorid" });
    }

    // Allow any syntactically valid email (not just UofT)
    const simpleEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!simpleEmail.test(email)) {
        return res.status(400).send({ error: "Invalid email" });
    }

    if (name.length > 50) {
        return res.status(400).send({ error: "Name too long" });
    }

    const user1 = await prisma.user.findUnique({ where: { utorid: utorid } });
    if (user1) {
        return res.status(409).send({ error: "Utorid already exists" });
    }

    if (password.length < 6) {
        return res.status(400).send({ error: "Password too short" });
    }

    const newUser = await prisma.user.create({
        data: {
            utorid: utorid,
            name: name,
            email: email,
            password: password,
            role: 'regular',
            expiresAt: new Date(Date.now() + 60 * 60 * 1000),
        }
    });

    return res.status(201).send({
        id: newUser.id,
        utorid: newUser.utorid,
        name: newUser.name,
        email: newUser.email,
        verified: newUser.verified,
        expiresAt: newUser.expiresAt,
        resetToken: newUser.resetToken
    });
});

// Update role for a given user (manager/superuser)
router.patch("/:utorid/role", async (req, res) => {
    const tokenHeader = req.headers.authorization;
    if (!tokenHeader) return res.status(401).send({ error: "Not authorized" });
    const parts = tokenHeader.split(" ");
    if (parts.length !== 2 || parts[0].toLowerCase() !== "bearer") {
        return res.status(401).send({ error: "Invalid authorization header" });
    }
    const token = parts[1];
    const data = utils.decodeJWToken(token);

    const authUser = await prisma.user.findUnique({ where: { utorid: data.utorid } });
    if (!authUser) return res.status(401).send({ error: "User not found" });
    if (!['manager', 'superuser'].includes(authUser.role)) return res.status(403).send({ error: "Action not permitted" });

    const { role } = req.body || {};
    if (!role || !['regular', 'cashier', 'manager', 'superuser'].includes(role)) {
        return res.status(400).send({ error: "Invalid role" });
    }

    try {
        const updated = await prisma.user.update({
            where: { utorid: req.params.utorid },
            data: { role }
        });
        return res.status(200).send({ utorid: updated.utorid, role: updated.role });
    } catch (e) {
        if (e.code === 'P2025') return res.status(404).send({ error: "User not found" });
        return res.status(500).send({ error: "Internal server error" });
    }
});

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

    const data = utils.decodeJWToken(token)

    const authUser = await prisma.user.findUnique({
        where: { utorid: data.utorid }
    });

    if (!authUser) {
        return res.status(401).send({ error: "User not found" });
    }

    if (authUser.role === 'regular') {
        return res.status(403).send({ error: "Action not permitted" });
    }

    if (data.exp * 1000 < Date.now()) {
        return res.status(401).send({ error: "Expired token" });
    }

    let {
        name = null,
        role = null,
        verified = null,
        activated = null,
        page = 1,
        limit = 10
    } = req.query;

    page = Number(page);
    limit = Number(limit);

    if (Number.isNaN(page) || Number.isNaN(limit)
        || page < 1 || limit < 1) {
        return res.status(400).send({ error: "Invalid pagination" });
    }

    verified = verified === 'true' ? true : verified === 'false' ? false : null;
    activated = activated === 'true' ? true : activated === 'false' ? false : null;

    const filters = (Object.entries({
        name: name !== null ? { contains: name } : null,
        role: role,
        verified: verified,
        activated: activated
    })).reduce((acc, e) => { if (e[1] != null) { acc[e[0]] = e[1]; } return acc; }, {});

    if (activated !== null) {
        if (activated === true) {
            filters.lastLogin = { not: null };  // Has logged in = activated
        } else {
            filters.lastLogin = null;  // Never logged in = not activated
        }
    }

    const count = await prisma.user.count({ where: filters });

    const users = await prisma.user.findMany({
        where: filters,
        select: {
            id: true,
            utorid: true,
            name: true,
            email: true,
            birthday: true,
            role: true,
            points: true,
            createdAt: true,
            lastLogin: true,
            verified: true,
            avatarUrl: true
        },
        skip: (page - 1) * limit,
        take: limit,
    });

    return res.status(200).send({ count: count, results: users });
});

router.get("/me", async (req, res) => {
    const tokenHeader = req.headers.authorization;
    if (!tokenHeader) {
        return res.status(401).send({ error: "Not authorized" });
    }

    const parts = tokenHeader.split(" ");
    if (parts.length !== 2 || parts[0].toLowerCase() !== "bearer") {
      return res.status(401).send({ error: "Invalid authorization header" });
    }
    const token = parts[1];

    const data = utils.decodeJWToken(token)

    const authUser = await prisma.user.findUnique({
        where: { utorid: data.utorid },
        select: {
            id: true,
            utorid: true,
            name: true,
            email: true,
            birthday: true,
            role: true,
            points: true,
            createdAt: true,
            lastLogin: true,
            verified: true,
            avatarUrl: true,
            promotions: true,
        }
    });

    if (!authUser) {
        return res.status(401).send({ error: "User not found" });
    }

    authUser.lastLogin = authUser.lastLogin.toISOString();

    return res.status(200).send(authUser);
});

// Get a specific user (manager/superuser only)
router.get("/:utorid", async (req, res) => {
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

    const authUser = await prisma.user.findUnique({ where: { utorid: data.utorid } });
    if (!authUser) return res.status(401).send({ error: "User not found" });
    if (!['manager', 'superuser'].includes(authUser.role)) return res.status(403).send({ error: "Action not permitted" });

    const target = await prisma.user.findUnique({
        where: { utorid: req.params.utorid },
        select: { utorid: true, name: true, email: true, role: true }
    });
    if (!target) return res.status(404).send({ error: "User not found" });
    return res.status(200).send({ user: target });
});

// Update a user's role (manager/superuser only)
router.patch("/:utorid/role", async (req, res) => {
    const tokenHeader = req.headers.authorization;
    if (!tokenHeader) return res.status(401).send({ error: "Not authorized" });
    const parts = tokenHeader.split(" ");
    if (parts.length !== 2 || parts[0].toLowerCase() !== "bearer") {
        return res.status(401).send({ error: "Invalid authorization header" });
    }
    const token = parts[1];
    const data = utils.decodeJWToken(token);

    const authUser = await prisma.user.findUnique({ where: { utorid: data.utorid } });
    if (!authUser) return res.status(401).send({ error: "User not found" });
    if (!['manager', 'superuser'].includes(authUser.role)) return res.status(403).send({ error: "Action not permitted" });

    const { role } = req.body || {};
    if (!role || !['regular', 'cashier', 'manager', 'superuser'].includes(role)) {
        return res.status(400).send({ error: "Invalid role" });
    }

    const existing = await prisma.user.findUnique({ where: { utorid: req.params.utorid } });
    if (!existing) return res.status(404).send({ error: "User not found" });

    const updated = await prisma.user.update({
        where: { utorid: req.params.utorid },
        data: { role }
    });

    return res.status(200).send({ utorid: updated.utorid, role: updated.role });
});

router.patch("/me", upload.single('avatar'), (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).send({ error: 'File too large (max 5MB)' });
        }
        return res.status(400).send({ error: err.message });
    } else if (err) {
        return res.status(400).send({ error: err.message });
    }
    next();
}, async (req, res) => {
    // Authentication
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
    if (!data || !data.utorid) {
        return res.status(401).send({ error: "Invalid token" });
    }

    const authUser = await prisma.user.findUnique({
        where: { utorid: data.utorid }
    });

    if (!authUser) {
        return res.status(401).send({ error: "User not found" });
    }

    try {
        console.log('=== DEBUG /users/me PATCH ===');
        console.log('Request body:', JSON.stringify(req.body, null, 2));
        console.log('Has file?:', !!req.file);
        console.log('File name:', req.file ? req.file.filename : 'none');

        const { name, email, birthday } = req.body;
        console.log('Parsed - name:', name, '(type:', typeof name, ')');
        console.log('Parsed - email:', email, '(type:', typeof email, ')');
        console.log('Parsed - birthday:', birthday, '(type:', typeof birthday, ')');

        const updateData = {};

        console.log('=== VALIDATION START ===');
        let validFieldCount = 0;

        if (name !== undefined && name !== null) {
            console.log('Vaidating name:', name);
            if (typeof name !== "string" || name.length < 1 || name.length > 50) {
                return res.status(400).send({ error: "Invalid name (1-50 characters)" });
            }
            updateData.name = name;
            validFieldCount++;
        }

        if (email !== undefined && email !== null) {
            console.log('Validating email:', email);
            if (typeof email !== "string") {
                console.log('ERROR: email is null');
                return res.status(400).send({ error: "Invalid email" });
            }
            if (!utils.checkEmail(email)) {
                console.log('ERROR: email is not UofT email');
                return res.status(400).send({ error: "Invalid UofT email" });
            }

            const existingUser = await prisma.user.findFirst({
                where: {
                    email: email,
                    utorid: { not: authUser.utorid }
                }
            });
            if (existingUser) {
                console.log('ERROR: email already exists');
                return res.status(400).send({ error: "Email already exists" });
            }
            updateData.email = email;
            validFieldCount++;
        }

        if (birthday !== undefined) {
            console.log('Validating birthday:', birthday);
            if (birthday === null) {
                updateData.birthday = null;
            } else {
                if (typeof birthday !== "string") {
                    console.log('ERROR: birthday is not string');
                    return res.status(400).send({ error: "Invalid birthday" });
                }
                const regex = /^\d{4}-\d{2}-\d{2}$/;
                if (!regex.test(birthday)) {
                    console.log('ERROR: birthday is not proper format');
                    return res.status(400).send({ error: "Invalid date format (YYYY-MM-DD)" });
                }

                const date = new Date(birthday + 'T00:00:00');
                if (isNaN(date.getTime())) {
                    console.log('ERROR: date is not proper');
                    return res.status(400).send({ error: "Invalid date" });
                }
                // Check if date was auto-corrected (e.g., Feb 31 → Mar 3)
                const [year, month, day] = birthday.split('-').map(Number);
                if (date.getFullYear() !== year ||
                    (date.getMonth() + 1) !== month ||
                    date.getDate() !== day) {
                    console.log('FAIL: date was auto-corrected', {input: birthday, parsed: date});
                    return res.status(400).send({ error: "Invalid date" });
                }
                updateData.birthday = date;
                validFieldCount++;
            }
        }

        // Handle avatar (file upload)
        if (req.file) {
            updateData.avatarUrl = `/uploads/avatars/${req.file.filename}`;
        }

         // Check if ANY fields were provided in request
        const hasFieldsInRequest = name !== undefined || email !== undefined ||
                                birthday !== undefined || req.file !== undefined;

        if (!hasFieldsInRequest) {
            console.log('ERROR: No fields in request');
            return res.status(400).send({ error: "No fields to update" });
        }

        // Check if at least one field has a valid (non-null) value
        if (validFieldCount === 0 && !req.file) {
            return res.status(400).send({ error: "No valid fields to update" });
        }

        console.log('Update data after validation:', updateData);
        console.log('Update data keys:', Object.keys(updateData));

        if (Object.keys(updateData).length === 0) {
            // No fields to update, return current user data
            console.log('No changes needed, returning current user');
            const currentUser = await prisma.user.findUnique({
                where: { utorid: data.utorid },
                select: {
                    id: true,
                    utorid: true,
                    name: true,
                    email: true,
                    birthday: true,
                    role: true,
                    points: true,
                    createdAt: true,
                    lastLogin: true,
                    verified: true,
                    avatarUrl: true
                }
            });

            const response = {
                ...currentUser,
                birthday: currentUser.birthday ? currentUser.birthday.toISOString().split('T')[0] : null,
                createdAt: currentUser.createdAt.toISOString(),
                lastLogin: currentUser.lastLogin ? currentUser.lastLogin.toISOString() : null
            };

            return res.status(200).send(response);
        }

        // Perform update
        const updatedUser = await prisma.user.update({
            where: { utorid: data.utorid },
            data: updateData,
            select: {
                id: true,
                utorid: true,
                name: true,
                email: true,
                birthday: true,
                role: true,
                points: true,
                createdAt: true,
                lastLogin: true,
                verified: true,
                avatarUrl: true
            }
        });

        // Format dates
        const response = {
            ...updatedUser,
            birthday: updatedUser.birthday ? updatedUser.birthday.toISOString().split('T')[0] : null,
            createdAt: updatedUser.createdAt.toISOString(),
            lastLogin: updatedUser.lastLogin ? updatedUser.lastLogin.toISOString() : null
        };

        return res.status(200).send(response);

    } catch (error) {
        console.error(error);
        return res.status(500).send({ error: "Internal server error" });
    }
});

router.get("/:userId", async (req, res) => {
    const tokenHeader = req.headers.authorization;
    if (!tokenHeader) {
        return res.status(401).send({ error: "Not authorized" });
    }

    const parts = tokenHeader.split(" ");
    if (parts.length !== 2 || parts[0].toLowerCase() !== "bearer") {
      return res.status(401).send({ error: "Invalid authorization header" });
    }
    const token = parts[1];

    const data = utils.decodeJWToken(token)

    const authUser = await prisma.user.findUnique({
        where: { utorid: data.utorid }
    });

    if (!authUser) {
        return res.status(401).send({ error: "User not found" });
    }

    if (authUser.role === 'regular') {
        return res.status(403).send({ error: "Action not permitted" });
    }

    const userId = Number(req.params.userId);

    let user;
    if (data.role === 'cashier') {
        user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                utorid: true,
                email: true,
                name: true,
                points: true,
                verified: true,
                promotions: {
                    select: {
                        id: true,
                        name: true,
                        minSpending: true,
                        rate: true,
                        points: true,
                    }
                }
            }
        });
    } else {
       user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                utorid: true,
                name: true,
                email: true,
                birthday: true,
                role: true,
                points: true,
                createdAt: true,
                lastLogin: true,
                verified: true,
                avatarUrl: true,
                promotions: {
                    select: {
                        id: true,
                        name: true,
                        minSpending: true,
                        rate: true,
                        points: true,
                    }
                }
            }
        });

    }

    return res.send(user);

});

router.patch("/:userId", async (req, res) => {
    const tokenHeader = req.headers.authorization;
    if (!tokenHeader) {
        return res.status(401).send({ error: "Not authorized" });
    }

    const parts = tokenHeader.split(" ");
    if (parts.length !== 2 || parts[0].toLowerCase() !== "bearer") {
      return res.status(401).send({ error: "Invalid authorization header" });
    }
    const token = parts[1];

    const data = utils.decodeJWToken(token)

    const authUser = await prisma.user.findUnique({
        where: { utorid: data.utorid }
    });

    if (!authUser) {
        return res.status(401).send({ error: "User not found" });
    }

    if (data.role === 'regular' || data.role === 'cashier') {
        return res.status(403).send({ error: "Action not permitted" });
    }

    const userId = Number(req.params.userId);

    let {
        email = null,
        verified = null,
        suspicious = null,
        role = null,
    } = req.body;

    if (email === null && verified === null && suspicious === null && role === null) {
        return res.status(400).send({ error: "No payload" });
    }

    if (email && !utils.checkEmail(String(email))) {
        return res.status(400).send({ error: "Invalid email"});
    }

    if (verified !== null && verified !== true) {
        return res.status(400).send({ error: "Invalid verified"});
    }

    if (suspicious !== null && !(suspicious === true || suspicious === false)) {
        return res.status(400).send({ error: "Invalid suspicious"});
    }

    if (role && !['regular', 'cashier', 'manager', 'superuser'].includes(role)) {
        return res.status(400).send({ error: "Invalid role"});
    }

    if ((authUser.role === 'manager' || data.role === 'manager') && (role === 'superuser' || role == 'manager')) {
        return res.status(403).send({ error: "Action not permitted" });
    }

    let filters = (Object.entries({
        email: email,
        role: role,
        verified: verified,
        suspicious: suspicious
    })).reduce((acc, e) => { if (e[1] !== null) { acc[e[0]] = e[1]; } return acc; }, {});

    const updated = await prisma.user.update({
        where: { id: userId },
        data: filters,
        select: {
            id: true,
            utorid: true,
            name: true,
            ...Object.fromEntries(Object.keys(filters).map(key => [key, true]))
        }
    });

    return res.status(200).send(updated);
});

router.post("/me/transactions", async (req, res) => {
    const tokenHeader = req.headers.authorization;
    if (!tokenHeader) {
        return res.status(401).send({ error: "Not authorized" });
    }

    const parts = tokenHeader.split(" ");
    if (parts.length !== 2 || parts[0].toLowerCase() !== "bearer") {
      return res.status(401).send({ error: "Invalid authorization header" });
    }
    const token = parts[1];

    const data = utils.decodeJWToken(token)

    const authUser = await prisma.user.findUnique({
        where: { utorid: data.utorid }
    });

    if (!authUser) {
        return res.status(401).send({ error: "User not found" });
    }

    const type = req.body.type;
    if (type !== 'redemption') return res.status(400).send({error: "missing/invalid type"});

    const amount = req.body.amount;
    if ((amount === undefined || amount === null) || typeof amount !== 'number' || amount < 0) return res.status(400).send({ error: "invalid amount"});
    if (amount > authUser.points) return res.status(400).send({ error: "insufficient funds"});

    const remark = req.body.remark ? req.body.remark : "";

    const tx = await prisma.transaction.create({
        data: {
            type: type,
            amount: amount,
            remark: remark,
            redeemed: amount,
            createdBy: authUser.utorid,
            utorid: authUser.utorid,
        },
        select: {
            id: true,
            utorid: true,
            type:true,
            processedBy: true,
            amount: true,
            redeemed: true,
            remark: true,
            createdBy: true,
        }
    });

    await prisma.user.update({
        where: { id: authUser.id },
        data: { points: authUser.points - amount }
        });

    return res.status(201).send(tx);
});

router.get("/me/transactions", async (req, res) => {
    const tokenHeader = req.headers.authorization;
    if (!tokenHeader) {
        return res.status(401).send({ error: "Not authorized" });
    }
    const parts = tokenHeader.split(" ");
    if (parts.length !== 2 || parts[0].toLowerCase() !== "bearer") {
      return res.status(401).send({ error: "Invalid authorization header" });
    }
    const token = parts[1];
    const data = utils.decodeJWToken(token)
    const authUser = await prisma.user.findUnique({
        where: { utorid: data.utorid },
        include: {transactions: true}
    });
    if (!authUser) {
        return res.status(401).send({ error: "User not found" });
    }

    let txs = authUser.transactions;

    // Filter by query params
    const {id,  type, limit, suspicious, processedBy, createdBy } = req.query;
    console.log(txs)
    console.log(id)

    if (id) {
        txs = txs.filter(tx => tx.id === Number(id));
    }

    if (type) {
        txs = txs.filter(tx => tx.type === type);
    }

    if (suspicious !== undefined) {
        const isSuspicious = suspicious === 'true';
        txs = txs.filter(tx => tx.suspicious === isSuspicious);
    }

    if (processedBy) {
        txs = txs.filter(tx => tx.processedBy === processedBy);
    }

    if (createdBy) {
        txs = txs.filter(tx => tx.createdBy === createdBy);
    }

    // Apply limit after all filters
    if (limit) {
        const limitNum = parseInt(limit);
        if (!isNaN(limitNum) && limitNum > 0) {
            txs = txs.slice(0, limitNum);
        }
    }

    return res.status(200).send({ count: txs.length, results: txs});
});

router.post("/:userId/transactions", async (req, res) => {
    const userId = Number(req.params.userId);
    if (isNaN(userId)) return res.status(404).send({error: "invalid userid"});

    const tokenHeader = req.headers.authorization;
    if (!tokenHeader) {
        return res.status(401).send({ error: "Not authorized" });
    }

    const parts = tokenHeader.split(" ");
    if (parts.length !== 2 || parts[0].toLowerCase() !== "bearer") {
      return res.status(401).send({ error: "Invalid authorization header" });
    }
    const token = parts[1];

    const data = utils.decodeJWToken(token)

    const authUser = await prisma.user.findUnique({
        where: { utorid: data.utorid }
    });

    if (!authUser) {
        return res.status(401).send({ error: "User not found" });
    }

    if (!authUser.verified) return res.status(403).send({ error: "you must be verified to send"});

    const type = req.body.type;
    if (type !== 'transfer') return res.status(400).send({error: "missing/invalid type"});

    const amount = req.body.amount;
    if ((amount === undefined || amount === null) || typeof amount !== 'number' || amount < 0) return res.status(400).send({ error: "invalid amount"});
    if (amount > authUser.points) return res.status(400).send({ error: "insufficient points"})

    const remark = req.body.remark ? req.body.remark : "";

    const recipient = await prisma.user.findUnique({ where: { id: userId }});
    if (!recipient) return res.status(404).send({error: "could not find user"});

    const tx = await prisma.transaction.create({
        data: {
            type: type,
            sent: amount,
            remark: remark,
            createdBy: authUser.utorid,
            sender: authUser.utorid,
            recipient: recipient.utorid,
            utorid: authUser.utorid,
        },
        select: {
            id: true,
            sender:true,
            recipient: true,
            type:true,
            sent: true,
            remark: true,
            createdBy: true,
        }
    })

    await prisma.user.update({
        where: { id: authUser.id },
        data: { points: authUser.points - amount }
        });

    await prisma.user.update({
        where: { id: userId },
        data: { points: recipient.points + amount }
    });

    return res.status(201).send(tx);
});

router.patch("/me/password", async (req, res) => {
    const tokenHeader = req.headers.authorization;
    if (!tokenHeader) {
        return res.status(401).send({ error: "Not authorized" });
    }

    const parts = tokenHeader.split(" ");
    if (parts.length !== 2 || parts[0].toLowerCase() !== "bearer") {
      return res.status(401).send({ error: "Invalid authorization header" });
    }
    const token = parts[1];

    const data = utils.decodeJWToken(token)

    const authUser = await prisma.user.findUnique({
        where: { utorid: data.utorid }
    });

    if (!authUser) {
        return res.status(401).send({ error: "User not found" });
    }

    const { old: oldPasswd = null, new: newPasswd = null, ...rest } = req.body;

    if (authUser.password) {
        if (!oldPasswd && authUser.password) return res.status(400).send({ error: "Usage: { <old> <new> }"});
        if (authUser.password !== oldPasswd) {
            return res.status(403).send({ error: "Invalid password" });
        }
    }

    if (!newPasswd || !utils.checkPassword(newPasswd)) {
        return res.status(400).send({ error: "Usage: { <old> <new> }" });
    }

    await prisma.user.update({
        where: { utorid: data.utorid },
        data: { password: newPasswd }
    });

    return res.status(200).send();
});

router.all("/", (req, res) => res.status(405).send({ error: "Method not allowed" }))

module.exports = router;
