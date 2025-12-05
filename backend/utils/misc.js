
const jwt = require('jsonwebtoken');
require('dotenv').config();

const SECRET_KEY = process.env.JWT_SECRET;

function checkEmail(email) {
    const email_parts = email.split("@");
    if (email_parts.length !== 2) return false;
    return email_parts[1] === "utoronto.ca" || email_parts[1].endsWith(".utoronto.ca");
}

function checkPassword(pw) {
    if (pw.length < 8 || pw.length > 20) return false;
    let hasUpper = false;
    let hasLower = false;
    let hasNumber = false;
    let hasSpecial = false;

    const specialChars = `!@#$%^&*()_-+={[}]|:;"'<,>.?/\\~\``;

    for (const char of pw) {
        if (char >= 'A' && char <= 'Z') {
            hasUpper = true;
        } else if (char >= 'a' && char <= 'z') {
            hasLower = true;
        } else if (char >= '0' && char <= '9') {
            hasNumber = true;
        } else if (specialChars.includes(char)) {
            hasSpecial = true;
        }

        // Stop early if all conditions met
        if (hasUpper && hasLower && hasNumber && hasSpecial) return true;
    }

    return hasUpper && hasLower && hasNumber && hasSpecial;
}

function generateJWToken(data, expiresIn) {
    const token = jwt.sign(data, SECRET_KEY, { expiresIn : expiresIn });
    const decoded = jwt.decode(token);
    const expireDate = new Date(decoded.exp * 1000).toISOString();
    return { token: token, expiresAt: expireDate };
}

function decodeJWToken(token) {
    return jwt.decode(token);
}

function isISODate(str) {
    const d = new Date(str);
    return !isNaN(d.getTime());
}

function authorization(allowed) {
    return async function(req, res, next) {
        let x = 0;
        try {
            const tokenHeader = req.headers.authorization;
            if (!tokenHeader) {
                return res.status(401).send({ error: "Not authorized" });
            }
            x++;
            const parts = tokenHeader.split(" ");
            if (parts.length !== 2 || parts[0].toLowerCase() !== "bearer") {
                return res.status(401).send({ error: "Invalid authorization header" });
            }
            const token = parts[1];
            x++;

            const data = utils.decodeJWToken(token);

            if (!data || !data.utorid) {
                return res.status(401).send({ error: "Invalid token payload" });
            }
            x++;

            const authUser = await prisma.user.findUnique({
                where: { utorid: data.utorid }
            });

            if (!authUser) {
                return res.status(401).send({ error: "User not found" });
            }
            x++;

            if (!allowed.includes(authUser.role)) {
                return res.status(403).send({ error: "not allowed" });
            }
            x++;
           if (data.exp * 1000 < Date.now()) {
                return res.status(401).send({ error: "Expired token" });
           }

            return next();

        } catch (e) {
            return res.status(500).send({ error: e.message, step: x });
        }
    }
}

module.exports = {
    checkEmail,
    generateJWToken,
    decodeJWToken,
    isISODate,
    authorization,
    checkPassword,
};
