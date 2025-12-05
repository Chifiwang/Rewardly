/*
 * Seed the database with a variety of users/roles.
 *
 * This keeps passwords in plain text to match the current auth route, which
 * checks `utorid` + `password` directly. Update to hashed passwords once the
 * auth flow supports it.
 */
'use strict';

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const users = [
  { utorid: 'admin01', name: 'Alex Admin', email: 'admin01@utoronto.ca', role: 'superuser', password: 'password123', points: 68250 },
  { utorid: 'manager01', name: 'Morgan Manager', email: 'manager01@utoronto.ca', role: 'manager', password: 'password123', points: 41200 },
  { utorid: 'cashier01', name: 'Casey Cashier', email: 'cashier01@utoronto.ca', role: 'cashier', password: 'password123', points: 15800 },
  { utorid: 'cashier02', name: 'Cameron Cashier', email: 'cashier02@utoronto.ca', role: 'cashier', password: 'password123', points: 9400 },
  { utorid: 'organizer01', name: 'Olivia Organizer', email: 'organizer01@utoronto.ca', role: 'manager', password: 'password123', points: 27550 },
  { utorid: 'organizer02', name: 'Oscar Organizer', email: 'organizer02@utoronto.ca', role: 'manager', password: 'password123', points: 19200 },
  { utorid: 'organizer03', name: 'Oriana Organizer', email: 'organizer03@utoronto.ca', role: 'manager', password: 'password123', points: 22400 },
  { utorid: 'user01', name: 'Pat User', email: 'user01@utoronto.ca', role: 'regular', password: 'password123', points: 3200 },
  { utorid: 'user02', name: 'Sam User', email: 'user02@utoronto.ca', role: 'regular', password: 'password123', points: 7800 },
  { utorid: 'user03', name: 'Jamie User', email: 'user03@utoronto.ca', role: 'regular', password: 'password123', points: 15200 },
  { utorid: 'user04', name: 'Taylor User', email: 'user04@utoronto.ca', role: 'regular', password: 'password123', points: 5400 },
  { utorid: 'user05', name: 'Riley User', email: 'user05@utoronto.ca', role: 'regular', password: 'password123', points: 11800 }
];

const events = [
  {
    name: "Rewards Rally",
    description: "Kick off the season with bonus points, live demos, and swag.",
    location: "BA 1160",
    startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    capacity: 120,
    published: true,
    pointsRemain: 5000,
    pointsAwarded: 0
  },
  {
    name: "VIP Tasting Night",
    description: "Invite-only tasting with partners, points multipliers, and perks.",
    location: "DH 2060",
    startTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    endTime: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
    capacity: 60,
    published: true,
    pointsRemain: 2500,
    pointsAwarded: 0
  },
  {
    name: "Campus Pop-up",
    description: "On-the-go signup booth with giveaways.",
    location: "BA 3195",
    startTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    endTime: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    capacity: 0,
    published: true,
    pointsRemain: 0,
    pointsAwarded: 1200
  },
  {
    name: "Holiday Kickoff",
    description: "Seasonal offers preview.",
    location: "IC 120",
    startTime: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    endTime: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000),
    capacity: 200,
    published: true,
    pointsRemain: 8000,
    pointsAwarded: 0
  },
  {
    name: "Member Appreciation",
    description: "Celebrate milestones with bonus gifts.",
    location: "SS 2102",
    startTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    endTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    capacity: 85,
    published: true,
    pointsRemain: 3000,
    pointsAwarded: 500
  },
  {
    name: "Tech Fair",
    description: "Hands-on demos of the newest features and partner booths.",
    location: "MP 102",
    startTime: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
    endTime: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),
    capacity: 150,
    published: true,
    pointsRemain: 4200,
    pointsAwarded: 300
  },
  {
    name: "Flash Giveaway",
    description: "One-hour surprise drop with instant point boosts.",
    location: "KB 315",
    startTime: new Date(Date.now() + 12 * 60 * 60 * 1000),
    endTime: new Date(Date.now() + 16 * 60 * 60 * 1000),
    capacity: 500,
    published: true,
    pointsRemain: 10000,
    pointsAwarded: 0
  },
  {
    name: "Late Night Study Break",
    description: "Coffee, snacks, and loyalty perks for night owls.",
    location: "BA 2175",
    startTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    endTime: new Date(Date.now() + 1.5 * 24 * 60 * 60 * 1000),
    capacity: 90,
    published: true,
    pointsRemain: 1500,
    pointsAwarded: 50
  },
  {
    name: "Weekend Pop-up",
    description: "Quick-stop booth to earn and redeem points on the go.",
    location: "UC 140",
    startTime: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),
    endTime: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    capacity: 75,
    published: true,
    pointsRemain: 2200,
    pointsAwarded: 150
  },
  {
    name: "Charity Drive",
    description: "Donate items to earn bonus points and give back.",
    location: "GS 2152",
    startTime: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    endTime: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
    capacity: 0,
    published: true,
    pointsRemain: 0,
    pointsAwarded: 2300
  },
  {
    name: "Campus Clean-up",
    description: "Join the sustainability crew and earn rewards.",
    location: "MS 2158",
    startTime: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    endTime: new Date(Date.now() + 4.5 * 24 * 60 * 60 * 1000),
    capacity: 120,
    published: true,
    pointsRemain: 3600,
    pointsAwarded: 120
  },
  {
    name: "Wellness Workshop",
    description: "Mindfulness, stretching, and healthy snack tastings.",
    location: "KP 108",
    startTime: new Date(Date.now() + 11 * 24 * 60 * 60 * 1000),
    endTime: new Date(Date.now() + 11.5 * 24 * 60 * 60 * 1000),
    capacity: 50,
    published: true,
    pointsRemain: 900,
    pointsAwarded: 75
  },
  {
    name: "Partner Expo",
    description: "Meet partner brands and collect exclusive offers.",
    location: "EX 200",
    startTime: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000),
    endTime: new Date(Date.now() + 19 * 24 * 60 * 60 * 1000),
    capacity: 250,
    published: true,
    pointsRemain: 7000,
    pointsAwarded: 0
  },
  {
    name: "Morning Jog Club",
    description: "Weekly jog with surprise streak bonuses.",
    location: "TR 001",
    startTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    endTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
    capacity: 30,
    published: true,
    pointsRemain: 0,
    pointsAwarded: 600
  },
  {
    name: "Evening Mixer",
    description: "Meet the community, share ideas, and enjoy refreshments.",
    location: "WB 116",
    startTime: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
    endTime: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
    capacity: 110,
    published: true,
    pointsRemain: 2800,
    pointsAwarded: 90
  },
  {
    name: "Flash Trivia",
    description: "Rapid-fire trivia with instant bonus points.",
    location: "HA 316",
    startTime: new Date(Date.now() + 20 * 60 * 60 * 1000),
    endTime: new Date(Date.now() + 22 * 60 * 60 * 1000),
    capacity: 300,
    published: true,
    pointsRemain: 6500,
    pointsAwarded: 0
  },
  {
    name: "Gear Swap",
    description: "Trade items and collect points for sustainable choices.",
    location: "AH 105",
    startTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    endTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000),
    capacity: 0,
    published: true,
    pointsRemain: 0,
    pointsAwarded: 1400
  },
  {
    name: "Leadership Lunch",
    description: "Panel discussion with leaders and reward tips.",
    location: "SS 1071",
    startTime: new Date(Date.now() + 13 * 24 * 60 * 60 * 1000),
    endTime: new Date(Date.now() + 13 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
    capacity: 80,
    published: true,
    pointsRemain: 1900,
    pointsAwarded: 0
  },
  {
    name: "Season Finale",
    description: "Wrap up the quarter with awards and bonus drops.",
    location: "BN 2S",
    startTime: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
    endTime: new Date(Date.now() + 26 * 24 * 60 * 60 * 1000),
    capacity: 300,
    published: true,
    pointsRemain: 9000,
    pointsAwarded: 0
  },
  {
    name: "Early Bird Breakfast",
    description: "Breakfast meetup with streak rewards for early arrivals.",
    location: "EC 107",
    startTime: new Date(Date.now() + 0.5 * 24 * 60 * 60 * 1000),
    endTime: new Date(Date.now() + 0.5 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
    capacity: 60,
    published: true,
    pointsRemain: 1200,
    pointsAwarded: 0
  },
  {
    name: "Loyalty Lab",
    description: "Live demos on earning, redeeming, and tracking points.",
    location: "BA 2195",
    startTime: new Date(Date.now() + 6 * 60 * 60 * 1000),
    endTime: new Date(Date.now() + 10 * 60 * 60 * 1000),
    capacity: 90,
    published: true,
    pointsRemain: 1800,
    pointsAwarded: 0
  },
  {
    name: "Study Sprint",
    description: "Co-working session with focus timers and snack boosts.",
    location: "RC 204",
    startTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000),
    capacity: 70,
    published: true,
    pointsRemain: 1300,
    pointsAwarded: 0
  },
  {
    name: "Point Sprint",
    description: "Limited-time challenges to rack up bonus rewards.",
    location: "BA 2179",
    startTime: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    endTime: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
    capacity: 140,
    published: true,
    pointsRemain: 3600,
    pointsAwarded: 0
  },
  {
    name: "Partner Meetup",
    description: "Network with partner reps and unlock exclusive perks.",
    location: "DH 2120",
    startTime: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    endTime: new Date(Date.now() + 11 * 24 * 60 * 60 * 1000),
    capacity: 180,
    published: true,
    pointsRemain: 4000,
    pointsAwarded: 50
  },
  {
    name: "Rewards Hack",
    description: "Mini-hackathon to prototype reward flows.",
    location: "BA 2159",
    startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000),
    capacity: 80,
    published: true,
    pointsRemain: 2100,
    pointsAwarded: 0
  },
  {
    name: "Mentor Mingle",
    description: "Speed mentoring with alumni and community leads.",
    location: "RW 110",
    startTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
    capacity: 65,
    published: true,
    pointsRemain: 900,
    pointsAwarded: 80
  },
  {
    name: "Coffee Chats",
    description: "Drop-in chats with the rewards team.",
    location: "GB 248",
    startTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    endTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
    capacity: 0,
    published: true,
    pointsRemain: 0,
    pointsAwarded: 300
  },
  {
    name: "Late Lab Hours",
    description: "Extended hours to experiment with the platform.",
    location: "BA 320",
    startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
    capacity: 100,
    published: true,
    pointsRemain: 2500,
    pointsAwarded: 0
  },
  {
    name: "Midterm Recharge",
    description: "Quiet zone with hydration, snacks, and bonus streaks.",
    location: "UC 244",
    startTime: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
    endTime: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000),
    capacity: 0,
    published: true,
    pointsRemain: 0,
    pointsAwarded: 1700
  },
  {
    name: "Finals Fiesta",
    description: "Celebrate the end of exams with big reward drops.",
    location: "SS 2105",
    startTime: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    endTime: new Date(Date.now() + 31 * 24 * 60 * 60 * 1000),
    capacity: 320,
    published: true,
    pointsRemain: 10000,
    pointsAwarded: 0
  },
  {
    name: "North Campus Pop-up",
    description: "Mobile booth for fast signups and redemptions.",
    location: "HM 108",
    startTime: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000),
    endTime: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000),
    capacity: 150,
    published: true,
    pointsRemain: 3300,
    pointsAwarded: 0
  },
  {
    name: "Don Mills Satellite",
    description: "Off-campus pop-up to reach commuters.",
    location: "BV 355",
    startTime: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
    endTime: new Date(Date.now() - 19 * 24 * 60 * 60 * 1000),
    capacity: 0,
    published: true,
    pointsRemain: 0,
    pointsAwarded: 2600
  },
  {
    name: "Merch Drop",
    description: "Limited merch release with bonus points on pickup.",
    location: "MY 150",
    startTime: new Date(Date.now() + 5 * 60 * 60 * 1000),
    endTime: new Date(Date.now() + 9 * 60 * 60 * 1000),
    capacity: 200,
    published: true,
    pointsRemain: 4200,
    pointsAwarded: 0
  },
  {
    name: "Rec Centre Raffle",
    description: "Join rec games and enter raffles for extra rewards.",
    location: "AC 223",
    startTime: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),
    endTime: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
    capacity: 140,
    published: true,
    pointsRemain: 2600,
    pointsAwarded: 0
  },
  {
    name: "Arts Night",
    description: "Showcase local art with reward boosts for attendees.",
    location: "IN 113",
    startTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    endTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
    capacity: 160,
    published: true,
    pointsRemain: 3100,
    pointsAwarded: 0
  },
  {
    name: "Digital Skills Workshop",
    description: "Learn digital marketing basics and earn bonus points.",
    location: "BA 2105",
    startTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
    capacity: 80,
    published: true,
    pointsRemain: 2400,
    pointsAwarded: 0
  },
  {
    name: "Outdoor Adventure Day",
    description: "Hiking excursion with post-activity rewards.",
    location: "Scarborough Bluffs",
    startTime: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    endTime: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000),
    capacity: 100,
    published: true,
    pointsRemain: 3500,
    pointsAwarded: 0
  },
  {
    name: "Entrepreneurship Panel",
    description: "Q&A with startup founders and point multipliers.",
    location: "BN 3105",
    startTime: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
    endTime: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
    capacity: 120,
    published: true,
    pointsRemain: 2200,
    pointsAwarded: 0
  },
  {
    name: "Sustainability Summit",
    description: "Campus sustainability initiatives and eco-rewards.",
    location: "Environmental Hub",
    startTime: new Date(Date.now() + 17 * 24 * 60 * 60 * 1000),
    endTime: new Date(Date.now() + 17 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
    capacity: 200,
    published: true,
    pointsRemain: 5000,
    pointsAwarded: 0
  },
  {
    name: "Game Night Showcase",
    description: "Board games, video games, and competitive rewards.",
    location: "RC 202",
    startTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000),
    capacity: 150,
    published: true,
    pointsRemain: 4000,
    pointsAwarded: 0
  }
];

const promotions = [
  {
    name: "Spring Kickoff Bonus",
    description: "Earn 2x points on all purchases over $25 this week.",
    type: "automatic",
    startTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    minSpending: 25,
    rate: 2.0,
    points: null
  },
  {
    name: "New Member Boost",
    description: "One-time bonus for new signups, no minimum spend.",
    type: "onetime",
    startTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    minSpending: null,
    rate: null,
    points: 800
  },
  {
    name: "Weekend Transfer Bonus",
    description: "Send points to friends and get 5% back on transfers.",
    type: "automatic",
    startTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    endTime: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    minSpending: null,
    rate: 1.05,
    points: null
  },
  {
    name: "Flash Redemption",
    description: "Redeem with a 300 point discount during this 24h window.",
    type: "onetime",
    startTime: new Date(Date.now() + 6 * 60 * 60 * 1000),
    endTime: new Date(Date.now() + 30 * 60 * 60 * 1000),
    minSpending: null,
    rate: null,
    points: 300
  },
  {
    name: "Loyalty Streak",
    description: "Hit 3 purchases in a week to unlock 1000 bonus points.",
    type: "automatic",
    startTime: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    endTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    minSpending: null,
    rate: null,
    points: 1000
  },
  {
    name: "Evening Bonus",
    description: "Earn 1.5x points on purchases made after 6 PM.",
    type: "automatic",
    startTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    endTime: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
    minSpending: null,
    rate: 1.5,
    points: null
  },
  {
    name: "Referral Boost",
    description: "Refer a friend and both get 600 bonus points.",
    type: "onetime",
    startTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    endTime: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    minSpending: null,
    rate: null,
    points: 600
  },
  {
    name: "Weekend Multiplier",
    description: "3x points on all weekend purchases.",
    type: "automatic",
    startTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    minSpending: null,
    rate: 3.0,
    points: null
  },
  {
    name: "Flash Signup Bonus",
    description: "First 100 new members get 1200 bonus points.",
    type: "onetime",
    startTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    minSpending: null,
    rate: null,
    points: 1200
  },
  {
    name: "Transfer Tuesday",
    description: "2x points on all transfers every Tuesday.",
    type: "automatic",
    startTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    endTime: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
    minSpending: null,
    rate: 2.0,
    points: null
  }
];

const transactions = [
  {
    type: "purchase",
    spent: 50,
    earned: 150,
    amount: 50,
    createdBy: "cashier01",
    suspicious: false,
    utorid: "user01",
    remark: "Cafeteria purchase"
  },
  {
    type: "purchase",
    spent: 20,
    earned: 40,
    amount: 20,
    createdBy: "cashier02",
    suspicious: false,
    utorid: "user02",
    remark: "Bookstore purchase"
  },
  {
    type: "purchase",
    spent: 80,
    earned: 240,
    amount: 80,
    createdBy: "cashier01",
    suspicious: false,
    utorid: "user03",
    remark: "Tech store purchase"
  },
  {
    type: "purchase",
    spent: 15,
    earned: 30,
    amount: 15,
    createdBy: "cashier02",
    suspicious: false,
    utorid: "user04",
    remark: "Snack purchase"
  },
  {
    type: "purchase",
    spent: 100,
    earned: 200,
    amount: 100,
    createdBy: "cashier01",
    suspicious: false,
    utorid: "user05",
    remark: "Merch shop purchase"
  },
  {
    type: "event",
    earned: 300,
    createdBy: "organizer01",
    suspicious: false,
    utorid: "user01",
    remark: "Attended Rewards Rally"
  },
  {
    type: "event",
    earned: 150,
    createdBy: "organizer01",
    suspicious: false,
    utorid: "user03",
    remark: "Attended Campus Pop-up"
  },
  {
    type: "event",
    earned: 600,
    createdBy: "organizer01",
    suspicious: false,
    utorid: "user04",
    remark: "Morning Jog Club reward"
  },
  {
    type: "event",
    earned: 120,
    createdBy: "organizer01",
    suspicious: false,
    utorid: "user05",
    remark: "Campus Clean-up participation"
  },
  {
    type: "transfer",
    sent: 500,
    recipient: "user03",
    sender: "user01",
    createdBy: "user01",
    suspicious: false,
    utorid: "user01",
    remark: "Sent points to friend"
  },
  {
    type: "transfer",
    earned: 500,
    recipient: "user03",
    sender: "user01",
    createdBy: "user01",
    suspicious: false,
    utorid: "user03",
    remark: "Received points from user01"
  },
  {
    type: "transfer",
    sent: 300,
    recipient: "user02",
    sender: "user05",
    createdBy: "user05",
    suspicious: false,
    utorid: "user05",
    remark: "Gift transfer"
  },
  {
    type: "transfer",
    earned: 300,
    recipient: "user02",
    sender: "user05",
    createdBy: "user05",
    suspicious: false,
    utorid: "user02",
    remark: "Received gift transfer"
  },
  {
    type: "purchase",
    spent: 40,
    earned: 80,
    createdBy: "cashier01",
    suspicious: false,
    utorid: "user02",
    remark: "Cafe purchase"
  },
  {
    type: "redemption",
    redeemed: 300,
    createdBy: "user02",
    suspicious: false,
    utorid: "user02",
    relatedId: 14,
    remark: "Redeemed for snack combo"
  },
  {
    type: "purchase",
    spent: 120,
    earned: 240,
    createdBy: "cashier02",
    suspicious: false,
    utorid: "user04",
    remark: "Electronics accessory"
  },
  {
    type: "redemption",
    redeemed: 500,
    createdBy: "user04",
    suspicious: false,
    utorid: "user04",
    relatedId: 16,
    remark: "Redeemed discount coupon"
  },
  {
    type: "adjustment",
    earned: 200,
    createdBy: "manager01",
    suspicious: false,
    utorid: "user01",
    remark: "Manual correction for missed event"
  },
  {
    type: "adjustment",
    spent: 0,
    earned: -150,
    createdBy: "manager01",
    suspicious: false,
    utorid: "user03",
    remark: "Correction: reversed bonus"
  },
  {
    type: "adjustment",
    earned: 400,
    createdBy: "manager01",
    suspicious: false,
    utorid: "user05",
    remark: "Promo adjustment"
  },
  {
    type: "purchase",
    spent: 30,
    earned: 60,
    createdBy: "cashier02",
    suspicious: false,
    utorid: "user01",
    remark: "Lunch"
  },
  {
    type: "purchase",
    spent: 10,
    earned: 20,
    createdBy: "cashier02",
    suspicious: false,
    utorid: "user02",
    remark: "Vending machine"
  },
  {
    type: "purchase",
    spent: 200,
    earned: 400,
    createdBy: "cashier01",
    suspicious: false,
    utorid: "user03",
    remark: "Big purchase"
  },
  {
    type: "purchase",
    spent: 75,
    earned: 150,
    createdBy: "cashier02",
    suspicious: false,
    utorid: "user05",
    remark: "Clothing shop purchase"
  },
  {
    type: "redemption",
    redeemed: 200,
    createdBy: "user05",
    suspicious: false,
    utorid: "user05",
    relatedId: 25,
    remark: "Redeemed promo code"
  },
  {
    type: "event",
    earned: 90,
    createdBy: "organizer01",
    suspicious: false,
    utorid: "user02",
    remark: "Evening Mixer participation"
  },
  {
    type: "event",
    earned: 50,
    createdBy: "organizer01",
    suspicious: false,
    utorid: "user01",
    remark: "Late Night Study Break"
  },
  {
    type: "event",
    earned: 80,
    createdBy: "organizer01",
    suspicious: false,
    utorid: "user03",
    remark: "Mentor Mingle"
  },
  {
    type: "transfer",
    sent: 200,
    recipient: "user01",
    sender: "user04",
    createdBy: "user04",
    suspicious: false,
    utorid: "user04",
    remark: "Helped friend"
  },
  {
    type: "transfer",
    earned: 200,
    recipient: "user01",
    sender: "user04",
    createdBy: "user04",
    suspicious: false,
    utorid: "user01",
    remark: "Received from user04"
  },
];

async function main() {
  for (const u of users) {
    await prisma.user.upsert({
      where: { utorid: u.utorid },
      update: {
        name: u.name,
        email: u.email,
        role: u.role,
        password: u.password,
        verified: true,
        activated: true,
        points: u.points ?? 0,
      },
      create: {
        utorid: u.utorid,
        name: u.name,
        email: u.email,
        role: u.role,
        password: u.password,
        verified: true,
        activated: true,
        points: u.points ?? 0,
      },
    });
  }

  await prisma.event.deleteMany();
  await prisma.event.createMany({ data: events });

  await prisma.promotion.deleteMany();
  await prisma.promotion.createMany({ data: promotions });

  // Attach some organizers/guests for testing flows
  const userLookup = {};
  for (const u of await prisma.user.findMany()) {
    userLookup[u.utorid] = u;
  }

  const promosAll = await prisma.promotion.findMany({ orderBy: { id: 'asc' }, select: { id: true, name: true } });
  // Assign sample promotions to users so "My Promotions" is populated
  const promoAssignment = {
    user01: promosAll.slice(0, 2),
    user02: promosAll.slice(2, 4),
    user03: promosAll.slice(4, 6),
    user04: promosAll.slice(6, 8),
    user05: promosAll.slice(8, 10),
  };
  for (const [utorid, promos] of Object.entries(promoAssignment)) {
    const uid = userLookup[utorid]?.id;
    if (!uid) continue;
    for (const promo of promos) {
      await prisma.promotion.update({
        where: { id: promo.id },
        data: { user: { connect: { id: uid } } }
      });
    }
  }

  const pickEventIds = async (names) => {
    const fetched = await prisma.event.findMany({
      where: { name: { in: names } },
      select: { id: true, name: true },
    });
    return fetched;
  };

  const targetEvents = await pickEventIds([
    "Rewards Rally",
    "VIP Tasting Night",
    "Campus Pop-up",
    "Holiday Kickoff",
    "Member Appreciation",
    "Tech Fair",
    "Flash Giveaway",
    "Late Night Study Break",
    "Weekend Pop-up",
    "Charity Drive",
  ]);

  for (const ev of targetEvents) {
    await prisma.event.update({
      where: { id: ev.id },
      data: {
        organizers: { set: [] },
        guests: { set: [] }
      }
    });
  }

  // Add a different mix for a couple more events
  const extraEvents = await pickEventIds(["Evening Mixer", "Flash Trivia", "Partner Expo"]);
  for (const ev of extraEvents) {
    await prisma.event.update({
      where: { id: ev.id },
      data: {
        organizers: { set: [] },
        guests: { set: [] }
      }
    });
  }

  // Assign organizers and unique guest lists
  const eventsAll = await prisma.event.findMany({ orderBy: { id: 'asc' }, select: { id: true, name: true } });
  const organizerId = userLookup["organizer01"]?.id || userLookup["manager01"]?.id;

  const assignment = {
    user01: eventsAll.slice(0, 3),
    user02: eventsAll.slice(3, 6),
    user03: eventsAll.slice(6, 9),
    user04: eventsAll.slice(9, 12),
    user05: eventsAll.slice(12, 15),
  };

  for (const ev of eventsAll) {
    await prisma.event.update({
      where: { id: ev.id },
      data: {
        organizers: organizerId ? { connect: [{ id: organizerId }] } : undefined,
        guests: { set: [] }
      }
    });
  }

  // Assign new organizer02 and organizer03 events
  const organizer02Id = userLookup["organizer02"]?.id;
  const organizer03Id = userLookup["organizer03"]?.id;

  const organizer02Events = await pickEventIds(["Digital Skills Workshop", "Game Night Showcase"]);
  const organizer03Events = await pickEventIds(["Outdoor Adventure Day", "Entrepreneurship Panel", "Sustainability Summit"]);

  for (const ev of organizer02Events) {
    await prisma.event.update({
      where: { id: ev.id },
      data: {
        organizers: organizer02Id ? { connect: [{ id: organizer02Id }] } : undefined
      }
    });
  }

  for (const ev of organizer03Events) {
    await prisma.event.update({
      where: { id: ev.id },
      data: {
        organizers: organizer03Id ? { connect: [{ id: organizer03Id }] } : undefined
      }
    });
  }

  for (const [utorid, evs] of Object.entries(assignment)) {
    const uid = userLookup[utorid]?.id;
    if (!uid) continue;
    for (const ev of evs) {
      await prisma.event.update({
        where: { id: ev.id },
        data: {
          guests: { connect: [{ id: uid }] }
        }
      });
    }
  }

  await prisma.transaction.deleteMany();
  for (const tx of transactions) {
    const uid = userLookup[tx.utorid].id;
    if (!uid) continue;

    // Prepare transaction data without relational fields
    const txData = { ...tx };
    delete txData.user;   // Remove any user field if present
    delete txData.utorid; // Remove utorid since Prisma will handle via connect

    await prisma.transaction.create({
      data: {
        ...txData,
        user: { connect: { id: uid } } // link to user
      }
    });
  }

  console.log(`Seeded ${users.length} users, ${events.length} events, ${transactions.length} transactions, and ${promotions.length} promotions with sample attendance.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
