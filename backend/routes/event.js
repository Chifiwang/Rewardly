const { PrismaClient } = require('@prisma/client');
const express = require("express");
const bcrypt = require('bcrypt');
// const multer = require("multer");

const prisma = new PrismaClient();
const router = express.Router();

const utils = require("../utils/misc");

router.get("/", async (req, res) => {
    try {
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

        let filters = {};

        // Check for invalid combination
        if (req.query.started && req.query.ended) {
            return res.status(400).send({ error: "Cannot specify both started and ended" });
        }

        // Managers/superusers can see all events
        if (['manager', 'superuser'].includes(authUser.role)) {
            if (req.query.published === 'true' || req.query.published === 'false') {
                filters.published = req.query.published === 'true';
            }

            // Add other filters
            if (req.query.id) filters.id = Number(req.query.id);
            if (req.query.name) filters.name = { contains: req.query.name };
            if (req.query.location) filters.location = { contains: req.query.location };

            if (req.query.started === 'true') filters.startTime = { lt: new Date() };
            else if (req.query.started === 'false') filters.startTime = { gt: new Date() };

            if (req.query.ended === 'true') filters.endTime = { lt: new Date() };
            else if (req.query.ended === 'false') filters.endTime = { gt: new Date() };

        } else {
            // Regular users only see published events
            filters.published = true;

            if (req.query.id) filters.id = Number(req.query.id);
            if (req.query.name) filters.name = { contains: req.query.name };
            if (req.query.location) filters.location = { contains: req.query.location };

            if (req.query.started === 'true') filters.startTime = { lt: new Date() };
            else if (req.query.started === 'false') filters.startTime = { gt: new Date() };

            if (req.query.ended === 'true') filters.endTime = { lt: new Date() };
            else if (req.query.ended === 'false') filters.endTime = { gt: new Date() };
        }
        console.log(filters)

        // Handle pagination
        let page = 1;
        let limit = 10;

        if (req.query.page) {
            page = Number(req.query.page);
            if (isNaN(page) || page < 1) return res.status(400).send({ error: "Invalid page" });
        }

        if (req.query.limit) {
            limit = Number(req.query.limit);
            if (isNaN(limit) || !Number.isInteger(limit) || limit < 1) return res.status(400).send({ error: "Invalid limit" });
        }
        console.log(filters)

        const count = await prisma.event.count({ where: filters });
        let events = await prisma.event.findMany({
            where: filters,
            select: {
                id: true,
                name: true,
                description: true,
                location: true,
                startTime: true,
                endTime: true,
                capacity: true,
                guests: { select: { utorid: true } },
                organizers: { select: { utorid: true } },
                ...(['manager', 'superuser'].includes(authUser.role) && {
                    pointsRemain: true,
                    pointsAwarded: true,
                    published: true
                }),
                _count: { select: { guests: true } }
            },
            skip: (page - 1) * limit,
            take: limit,
        });
        console.log(filters)

        events.forEach((e) => {
            e.numGuests = e._count.guests;
            delete e._count;
        });

        return res.status(200).send({ count, results: events });

    } catch (error) {
        return res.status(500).send({ error: error });
    }
});

router.post("/", async (req, res) => {
    console.log(req.body);
    const dat = req.body;

    const required = ["name","description","location","startTime","endTime","points"];
    for (const key of required) {
        if (req.body[key] === undefined || req.body[key] === null) {
            return res.status(400).send({ error: `${key} is required` });
        }
    }

    if (!utils.isISODate(req.body.startTime) || !utils.isISODate(req.body.endTime)) {
        return res.status(400).send({ error: "Wrong date format" });
    }

    const startTime = new Date(req.body.startTime);
    const endTime = new Date(req.body.endTime);

    if (startTime > endTime) {
        return res.status(400).send({ error: "Cannot end before start" });
    }


    try {
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
            return res.status(401).send({ error: "Invalid token payload" });
        }

        const authUser = await prisma.user.findUnique({
            where: { utorid: data.utorid }
        });

        if (!authUser) {
            return res.status(401).send({ error: "User not found" });
        }

        if (['regular', 'cashier'].includes(authUser.role)) {
            return res.status(403).send({ error: "Action not permitted" });
        }

    } catch (error) {
        return res.status(500).send({ error: "Internal server error" });
    }

    if (req.body.points === null || typeof req.body.points !== 'number' || req.body.points < 0) {
        return res.status(400).send({ error: "Points invalid" });
    }

    if (req.body.capacity !== null) {
        if (typeof req.body.capacity !== 'number' || req.body.capacity < 0) {
            return res.status(400).send({ error: "Invalid capacity" });
        }
    }
    const eventObj = await prisma.event.create({
        data: {
            name: req.body.name,
            description: req.body.description,
            location: req.body.location,
            startTime: startTime,
            endTime: endTime,
            capacity: req.body.capacity,
            pointsRemain: req.body.points ? req.body.points : 0,
            pointsAwarded: 0,
            published: false,
        },
        include: { organizers: true, guests: true }
    });

    return res.status(201).send(eventObj);
});

router.get("/:eventId", async (req, res) => {
    const eventId = Number(req.params.eventId);
    if (isNaN(eventId)) {
        return res.status(400).send({error: "Invalid event ID"});
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
        const event = await prisma.event.findUnique({
            where: { id: eventId },
            include: {
                organizers: { select: { id: true, utorid: true, name: true } },
                guests: { select: { id: true, utorid: true, name: true } }
            }
        });

        if (!event) return res.status(404).send({ error: "Event not found" });

        // Check if user is manager+ or organizer
        const isOrganizer = event.organizers.some(org => org.utorid === authUser.utorid);
        const isManager = ['manager', 'superuser'].includes(authUser.role);

        if (isManager || isOrganizer) {
            return res.status(200).send({
                id: event.id,
                name: event.name,
                description: event.description,
                location: event.location,
                startTime: event.startTime,
                endTime: event.endTime,
                capacity: event.capacity,
                pointsRemain: event.pointsRemain,
                pointsAwarded: event.pointsAwarded,
                published: event.published,
                organizers: event.organizers,
                guests: event.guests
            });
        }
        else {
            if (!event.published) return res.status(404).send({ error: "Event not found" });

            return res.status(200).send({
                id: event.id,
                name: event.name,
                description: event.description,
                location: event.location,
                startTime: event.startTime,
                endTime: event.endTime,
                capacity: event.capacity,
                organizers: event.organizers,
                numGuests: event.guests.length
            });
        }

    } catch (error) {
        return res.status(500).send({ error: "Internal server error" });
    }
});

router.patch("/:eventId", async (req, res) => {
    const eventId = Number(req.params.eventId);
    if (isNaN(eventId)) {
        return res.status(400).send({error: "Invalid Event"});
    }

    const body = req.body;
    console.log(body)
    const allowedFields = [
        "name",
        "description",
        "location",
        "startTime",
        "endTime",
        "capacity",
        "points",
        "published"
    ];

    const { name, description, location, startTime, endTime, capacity, points, published } = body;

    if (name && typeof name !== "string") {
        return res.status(400).send({ error: "Invalid 'name'" });
    }

    if (description && typeof description !== "string") {
        return res.status(400).send({ error: "Invalid 'description'" });
    }

    if (location && typeof location !== "string") {
        return res.status(400).send({ error: "Invalid 'location'" });
    }

    if (startTime) {
        const d = new Date(startTime);
        console.log(d)
        if (isNaN(d.getTime()) || d < Date.now()) {
            return res.status(400).send({ error: "Invalid 'startTime' (must be ISO 8601)" });
        }
    }

    if (endTime) {
        const d = new Date(endTime);
        if (isNaN(d.getTime())) {
            return res.status(400).send({ error: "Invalid 'endTime' (must be ISO 8601)" });
        }
    }

    if (startTime && endTime && new Date(endTime) <= new Date(startTime)) {
        return res.status(400).send({ error: "'endTime' must be after 'startTime'" });
    }

    if (capacity) {
        if (capacity !== null && (!Number.isInteger(capacity) || capacity <= 0)) {
            return res.status(400).send({ error: "Invalid 'capacity' (must be positive integer or null)" });
        }
    }

    if (points) {
        if (!Number.isInteger(points) || points <= 0) {
            return res.status(400).send({ error: "Invalid 'points' (must be positive integer)" });
        }
    }

    if ((published !== undefined && published !== null)&& typeof published !== 'boolean') {
        return res.status(400).send({ error: "Invalid 'published' (must be boolean)" });
    }

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
        return res.status(401).send({ error: "Invalid token payload" });
    }

    const authUser = await prisma.user.findUnique({
        where: { utorid: data.utorid }
    });

    if (!authUser) {
        return res.status(401).send({ error: "User not found" });
    }

    try {
        // Get current event for validation
        const currentEvent = await prisma.event.findUnique({
            where: { id: eventId },
            include: { organizers: true, guests: true }
        });

        if (!currentEvent) return res.status(404).send({ error: "Event not found" });

        // Authorization
        const isOrganizer = currentEvent.organizers.some(org => org.utorid === authUser.utorid);
        const isManager = ['manager', 'superuser'].includes(authUser.role);

        if (!isOrganizer && !isManager) {
            return res.status(403).send({ error: "Action not permitted" });
        }

        // Build update data - FILTER OUT NULL VALUES FOR REQUIRED FIELDS
        const updateData = {};
        allowedFields.forEach(field => {
            if (req.body[field] !== undefined && req.body[field] !== null) {
                if (field === 'points') updateData['pointsAwarded'] = req.body[field];
                else updateData[field] = req.body[field];
            }
        });

        // Remove null values for required fields that can't be null
        if (updateData.name === null) delete updateData.name;
        if (updateData.location === null) delete updateData.location;

        // Check if capacity cap is broken
        // if ((capacity !== undefined && capacity != null)&& capacity < currentEvent.guests.length) {
        //     return res.status(400).send({ error: "Capacity too low for current guests" });
        // }

        if (capacity !== undefined) {
        if (capacity !== null && (!Number.isInteger(capacity) || capacity <= 0)) {
            return res.status(400).send({ error: "Invalid 'capacity' (must be positive integer)" });
        }
        // Allow null to pass through to updateData
}

        // if (points !== undefined) {
            // const pointsReduction = currentEvent.pointsRemain - points;
            // if (pointsReduction < 0) {
                // return res.status(400).send({ error: "Points reduction would make remaining points negative" });
            // }
        // }

        // Manager-only fields
        if (!isManager && (points !== undefined || published !== undefined)) {
            return res.status(403).send({ error: "Only managers can update points or published status" });
        }

        // Time-based restrictions
        const now = new Date();
        if (currentEvent.startTime < now) {
            const restrictedFields = ['name', 'description', 'location', 'startTime', 'capacity'];
            const updatingRestricted = Object.keys(updateData).some(field => restrictedFields.includes(field));
            if (updatingRestricted) {
                return res.status(400).send({ error: "Cannot update event details after start time" });
            }
        }

        if (currentEvent.endTime < now && updateData.endTime) {
            return res.status(400).send({ error: "Cannot update end time after original end time" });
        }

        // Perform update
        const updatedEvent = await prisma.event.update({
            where: { id: eventId },
            data: updateData
        });

        // Build response with only updated fields
        const response = {
            id: updatedEvent.id,
            name: updatedEvent.name,
            location: updatedEvent.location
        };
        Object.keys(updateData).forEach(field => {
            response[field] = updatedEvent[field];
        });

        return res.status(200).json(response);

    } catch (error) {
        console.error('PATCH Error:', error.message);
        if (error.code === 'P2025') return res.status(404).send({ error: "Event not found" });
        return res.status(500).send({ error: "Internal server error" });
    }
});

router.delete("/:eventId", async (req, res) => {
    const eventId = Number(req.params.eventId);

    if (isNaN(eventId)) {
        return res.status(400).send({ error: "Invalid event ID" });
    }

    // Check for password in request body
    const { password } = req.body;
    if (!password) {
        return res.status(400).send({ error: "Password is required" });
    }

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

    // Verify password FIRST (plain text comparison since passwords aren't hashed)
    if (password !== authUser.password) {
        return res.status(401).send({ error: "Invalid password" });
    }

    // Authorization - Manager or higher
    if (!['manager', 'superuser'].includes(authUser.role)) {
        return res.status(403).send({ error: "Action not permitted" });
    }

    try {
        // Does this event exist?
        const event = await prisma.event.findUnique({
            where: { id: eventId }
        });

        if (!event) {
            return res.status(404).send({ error: "Event not found" });
        }

        // Allow deletion even if published (password was already verified)

        await prisma.event.delete({
            where: { id: eventId }
        });

        return res.status(204).send();
    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).send({ error: "Event not found" });
        }
        return res.status(500).send({ error: "Internal server error" });
    }
});

router.post("/:eventId/organizers", async (req, res) => {
    if (!req.body.utorid) {
        return res.status(400).send({ error: "missing organizer" });
    }

    const eventId = Number(req.params.eventId);
    if (isNaN(eventId)) {
        return res.status(400).send({ error: "Invalid Event" });
    }

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

    // Authorization
    if (!['manager', 'superuser'].includes(authUser.role)) {
        return res.status(403).send({ error: "Action not permitted" });
    }

    try {
        // Check if event exists and get guests
        const event = await prisma.event.findUnique({
            where: { id: eventId },
            include: {
                organizers: true,
                guests: true
            }
        });

        if (!event) {
            return res.status(404).send({ error: "Event not found" });
        }

        // Check if target user exists
        const targetUser = await prisma.user.findUnique({
            where: { utorid: req.body.utorid }
        });

        if (!targetUser) {
            return res.status(404).send({ error: "User not found" });
        }

        // Check if user is already an organizer
        if (event.organizers.some(org => org.utorid === req.body.utorid)) {
            return res.status(400).send({ error: "User is already an organizer" });
        }

        // Check if user is registered as a guest (400)
        if (event.guests.some(guest => guest.utorid === req.body.utorid)) {
            return res.status(400).send({ error: "User is registered as a guest" });
        }

        // Check if event has ended (410)
        if (new Date(event.endTime) < new Date()) {
            return res.status(410).send({ error: "Event has ended" });
        }

        // Add organizer to event
        const eventObj = await prisma.event.update({
            where: { id: eventId },
            data: {
                organizers: {
                    connect: { utorid: req.body.utorid }
                }
            },
            select: {
                id: true,
                name: true,
                location: true,
                organizers: {
                    select: {
                        id: true,
                        utorid: true,
                        name: true,
                    }
                }
            }
        });

        return res.status(201).send(eventObj);

    } catch (error) {
        console.error(error);
        return res.status(500).send({ error: "Internal server error" });
    }
});

router.delete("/:eventId/guests/me", async (req, res) => {
    /*
        Description: Remove the logged-in user from this event
        Clearance: Regular
        Payload: None
        Response:
            204 No Content on success,
            404 Not Found if user didn't RSVP to this event,
            410 Gone if event has ended
    */
    const eventId = Number(req.params.eventId);
    if (isNaN(eventId)) return res.status(400).send({ error: "Invalid event ID" });

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
        const event = await prisma.event.findUnique({
            where: { id: eventId },
            include: { guests: true }
        });

        // Check if event exists
        if (!event) return res.status(404).send({ error: "Event not found" });

        // Check if user didn't RSVP to this event
        const hasRSVPed = event.guests.some(guest => guest.utorid === authUser.utorid);
        if (!hasRSVPed) {
            return res.status(404).send({ error: "User did not RSVP to this event" })
        }

        // Remove user from event
        await prisma.event.update({
            where: { id: eventId },
            data: {
                guests: {
                    disconnect: { id: authUser.id }
                }
            }
        });

        return res.status(204).send();

    } catch (error) {
        return res.status(500).send({ error: "Internal server error" });
    }
});

router.delete("/:eventId/organizers/:userId", async (req, res) => {
    /*
        Description: Remove an organizer from this event
        Clearance: Manager or higher
        Payload: None
        Response: 204 No Content on Success
    */
    const eventId = Number(req.params.eventId);
    const userId = Number(req.params.userId);

    if (isNaN(eventId) || isNaN(userId)) {
        return res.status(400).send({ error: "Invalid ID" });
    }

    // Authentication & authorization (manager/superuser only)
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

    if (!['manager', 'superuser'].includes(authUser.role)) {
        return res.status(403).send({ error: "Action not permitted" });
    }

    try {
        // Remove organizer from event
        await prisma.event.update({
            where: { id: eventId },
            data: {
                organizers: {
                    disconnect: { id: userId }
                }
            }
        });

        return res.status(204).send();
    } catch (error) {
        return res.status(500).send({ error: "Internal server error" });
    }
});

router.post("/:eventId/guests", async (req, res) => {
    const eventId = Number(req.params.eventId);

    if (isNaN(eventId)) {
        return res.status(400).send({ error: "Invalid event ID" });
    }

    const { utorid } = req.body;
    if (!utorid) {
        return res.status(400).send({ error: "utorid is required" });
    }

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
        // Get event with organizers and guests
        const event = await prisma.event.findUnique({
            where: { id: eventId },
            include: {
                organizers: true,
                guests: true
            }
        });

        if (!event) {
            return res.status(404).send({ error: "Event not found" });
        }

        // Now check if the user is manager+ or an organizer
        // Permission to add guests

        // Check if user is already an organizer
        if (event.organizers.some(org => org.utorid === utorid)) {
            return res.status(400).send({ error: "User is an organizer" });
        }

        // Check if target user exists
        const guestUser = await prisma.user.findUnique({
            where: { utorid: utorid }
        });
        if (!guestUser) {
            return res.status(404).send({ error: "User not found" });
        }

        // Check if event is full
        if (event.capacity && event.guests.length >= event.capacity) {
            return res.status(410).send({ error: "Event is full" });
        }

        // Check if event has ended
        if (new Date(event.endTime) < new Date()) {
            return res.status(410).send({ error: "Event has ended" });
        }

        // Event visibility for organizers
        if (!event.published && !isOrganizer) {
            return res.status(404).send({ error: "Event not visible" });
        }

        // Check if user is already a guest
        if (event.guests.some(guest => guest.utorid === utorid)) {
            return res.status(400).send({ error: "User is already a guest" });
        }

        // Finally, add guest to event
        const updatedEvent = await prisma.event.update({
            where: { id: eventId },
            data: {
                guests: {
                    connect: { utorid: utorid }
                }
            },
            include: {
                guests: {
                    where: { utorid: utorid },
                    select: {
                        id: true,
                        utorid: true,
                        name: true
                    }
                },
                _count: {
                    select: { guests: true }
                }
            }
        });

        return res.status(201).send({
            id: event.id,
            name: event.name,
            location: event.location,
            guestAdded: updatedEvent.guests[0],
            numGuests: updatedEvent._count.guests
        });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ error: "Internal server error" });
    }
});

router.delete("/:eventId/guests/:userId", async (req, res) => {
    /*
        Description: Remove a guest from this event
        Clearance: Manager or higher (not organizers for this event)
        Payload: None
        Response: 204 No Content on Success
    */
    const eventId = Number(req.params.eventId);
    const userId = Number(req.params.userId);

    if (isNaN(eventId) || isNaN(userId)) {
        return res.status(400).send({ error: "Invalid ID" });
    }

    // Authentication & authorization (manager/superuser only)
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

    if (!['manager', 'superuser'].includes(authUser.role)) {
        return res.status(403).send({ error: "Action not permitted" });
    }

    try {
        // Check if event exists
        const event = await prisma.event.findUnique({
            where: { id: eventId },
            include: { guests: true }
        });
        if (!event) return res.status(404).send({ error: "Event not found" });

        // Check if the guest exists
        const guestExists = event.guests.some(g => g.id === userId);
        if (!guestExists) return res.status(404).send({ error: "Guest not found" });

        // Remove guest from event
        await prisma.event.update({
            where: { id: eventId },
            data: {
                guests: {
                    disconnect: { id: userId }
                }
            }
        });

        return res.status(204).send();
    } catch (error) {
        return res.status(500).send({ error: "Internal server error" });
    }
});

router.post("/:eventId/guests/me", async (req, res) => {
    /*
        Description: Add the logged-in user to the event
        Clearance: Regular
        Payload: None
        Response: 201 Created on success
        {
            "id": 1,
            "name", "Event 1",
            "location": "BA 2250",
            "guestAdded": { "id": 4, "utorid": "kian1234", "name": "Mo Kian" },
            "numGuests": 1
        },
        400 Bad Request if user already on guest list,
        410 Gone if the event is full or has ended

        Only the currently logged-in user should appear in the array.
    */
    const eventId = Number(req.params.eventId);
    if (isNaN(eventId)) return res.status(400).send({ error: "Invalid event ID" });

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
        const event = await prisma.event.findUnique({
            where: { id: eventId },
            include: { guests: true }
        });

        // Check if event exists and is published
        if (!event) return res.status(404).send({ error: "Event not found" });

        // Regular users can only see published events
        if (!event.published) {
            return res.status(404).send({ error: "Event not found" });
        }

        // Check if event ended
        if (new Date(event.endTime) < new Date()) {
            return res.status(410).send({ error: "Event has ended" });
        }

        // Check if event full
        if (event.capacity && event.guests.length >= event.capacity) {
            return res.status(410).send({ error: "Event is full" });
        }

        // Check if they're already a guest
        if (event.guests.some(guest => guest.utorid === authUser.utorid)) {
            return res.status(400).send({ error: "User already on guest list" });
        }

        // Add user as guest
        const updatedEvent = await prisma.event.update({
            where: { id: eventId },
            data: { guests: { connect: { utorid: authUser.utorid } } },
            include: {
                guests: { where: { utorid: authUser.utorid } },
                _count: { select: { guests: true } }
            }
        });

        return res.status(201).send({
            id: event.id,
            name: event.name,
            location: event.location,
            guestAdded: updatedEvent.guests[0],
            numGuests: updatedEvent._count.guests
        });

    } catch (error) {
        return res.status(500).send({ error: "Internal server error" });
    }
});

router.post("/:eventId/transactions", async (req, res) => {
    /*
        Description: Create a new reward transaction
        Clearance: Manager or higher, or an organizer for this event
        Payload: See Spec Document
        Response:
            201 Created on success (both utorid specified and not specified),
            404 Bad Request if user is not on guest list or remaining pts is less than
            requested amount

        Awarding points to guests can be done after an event has ended.
        After this transaction is created, the points are awarded to the user immediately.
        Points can be awarded to the same guest multiple times, i.e., without restriction.
        For example, the event organizer can first award johndoe1 500 points,
        then award all guests (including johndoe1) 50 points each.
    */
    const eventId = Number(req.params.eventId);
    if (isNaN(eventId)) return res.status(400).send({ error: "Invalid event ID" });

    const { type, utorid, amount, remark } = req.body;
    if (type !== "event") return res.status(400).send({ error: "Invalid type" });
    if (!amount || !Number.isInteger(amount) || amount <= 0) {
        return res.status(400).send({ error: "Invalid amount" });
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
        const event = await prisma.event.findUnique({
            where: { id: eventId },
            include: { organizers: true, guests: true }
        });

        if (!event) return res.status(404).send({ error: "Event not found" });

        // Authorization
        const isOrganizer = event.organizers.some(org => org.utorid === authUser.utorid);
        const hasManagerClearance = ['manager', 'superuser'].includes(authUser.role);
        if (!isOrganizer && !hasManagerClearance) {
            return res.status(403).send({ error: "Action not permitted" });
        }

        // Check points remaining
        if (event.pointsRemain < amount) {
            console.log(event.pointsRemain, amount)
            return res.status(400).send({ error: "Insufficient points remaining" });
        }

        if (utorid) {
            // Single user award
            const guest = event.guests.find(g => g.utorid === utorid);
            if (!guest) return res.status(400).send({ error: "User not on guest list" });

            // Update user points and event points
            await prisma.user.update({
                where: { utorid },
                data: { points: { increment: amount } }
            });

            await prisma.event.update({
                where: { id: eventId },
                data: {
                    pointsRemain: { decrement: amount },
                    pointsAwarded: { increment: amount }
                }
            });

            const transaction = await prisma.transaction.create({
                data: {
                    type: "event",
                    earned: amount,
                    remark,
                    createdBy: authUser.utorid,
                    utorid: utorid,
                    relatedId: eventId
                }
            });

            return res.status(201).send({
                id: transaction.id,
                recipient: utorid,
                awarded: amount,
                type: "event",
                relatedId: eventId,
                remark,
                createdBy: authUser.utorid
            });

        } else {
            // Award to all guests
            if (event.guests.length === 0) {
                return res.status(400).send({ error: "No guests to award" });
            }

            const totalAmount = amount * event.guests.length;
            if (event.pointsRemain < totalAmount) {
                return res.status(400).send({ error: "Insufficient points for all guests" });
            }

            // Update all users' points
            await Promise.all(event.guests.map(guest =>
                prisma.user.update({
                    where: { utorid: guest.utorid },
                    data: { points: { increment: amount } }
                })
            ));

            await prisma.event.update({
                where: { id: eventId },
                data: {
                    pointsRemain: { decrement: totalAmount },
                    pointsAwarded: { increment: totalAmount }
                }
            });

            // Create transactions for all guests
            const transactions = await Promise.all(event.guests.map(guest =>
                prisma.transaction.create({
                    data: {
                        type: "event",
                        earned: amount,
                        remark,
                        createdBy: authUser.utorid,
                        utorid: guest.utorid,
                        relatedId: eventId
                    }
                })
            ));

            return res.status(201).send(transactions.map(t => ({
                id: t.id,
                recipient: t.utorid,
                awarded: amount,
                type: "event",
                relatedId: eventId,
                remark,
                createdBy: authUser.utorid
            })));
        }

    } catch (error) {
        return res.status(500).send({ error: "Internal server error" });
    }
});

router.all("/", (req, res) => { return res.status(405).send({ error: "Not allowed"})});

module.exports = router;
