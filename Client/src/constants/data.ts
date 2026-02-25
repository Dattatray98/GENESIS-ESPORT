export const TOURNAMENT_INFO = {
    navName: "GENESIS ESPORTS 2026",
    name: "GENESIS ESPORTS S-1",
    subheading: "RISE OF COMPETITORS",
    subtitle: "IIC-SIT, LONAVALA PRESENTS",
    date: "FEBRUARY 28, 2026",
    location: "IIC-SIT, LONAVALA",
    prizePool: "₹ 5,000",
    totalTeams: 25,
    mode: "TPP / SQUAD",
    mapRotation: ["RONDO START", "ERANGEL", "MIRAMAR", "ERANGEL", "MIRAMAR", "ERANGEL"],
    reportingTime: "09:00 AM",
    startTime: "10:30 AM"
};

export const SCHEDULE = [
    { time: "10:00 AM", event: "CHECK-IN & REGISTRATION", type: "admin" },
    { time: "10:30 AM", event: "OPENING CEREMONY START", type: "ceremony" },
    { time: "11:00 AM", event: "MATCH 1: RONDO START", type: "game" },
    { time: "11:45 AM", event: "MATCH 2: ERANGEL START", type: "game" },
    { time: "12:30 PM", event: "MATCH 3: MIRAMAR START", type: "game" },
    { time: "01:15 PM", event: "LUNCH BREAK", type: "break" },
    { time: "01:50 PM", event: "MATCH 4: ERANGEL START", type: "game" },
    { time: "02:35 PM", event: "MATCH 5: MIRAMAR START", type: "game" },
    { time: "03:20 PM", event: "MATCH 6: ERANGEL START", type: "game" },
    { time: "03:50 PM", event: "FINAL RESULT & PRIZE DISTRIBUTION START", type: "ceremony" }
];

export const PRIZES = [
    { rank: "1st", amount: "₹ 2,500", color: "text-yellow-400", border: "border-yellow-400" },
    { rank: "2nd", amount: "₹ 1,500", color: "text-gray-300", border: "border-gray-300" },
    { rank: "3rd", amount: "₹ 750", color: "text-orange-600", border: "border-orange-600" },
    { rank: "MVP", amount: "₹ 250", color: "text-purple-400", border: "border-purple-400" }
];

export const RULES = [
    "Use of emulators is strictly prohibited.",
    "Teams must check-in 30 mins before match start.",
    "In-game voice chat only. Discord allowed for communication.",
    "Any form of hacking or exploits results in instant disqualification.",
    "Wait for admin instructions before joining the lobby."
];

export const SPONSORS = [
    { name: "TechGear", logo: "TG" },
    { name: "EnergyX", logo: "EX" },
    { name: "StreamPro", logo: "SP" },
    { name: "GamingHub", logo: "GH" }
];

export const CONTACT = {
    address: "IIC-SIT Campus, Gat No. 309/310, Kusgaon (Bk), Off Mumbai-Pune Expressway, Lonavala, Maharashtra 410401",
    email: "contact@genesisesports.com",
    phone: "+91 98765 43210",
    mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15124.81152069818!2d73.4005!3d18.7369!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be8010996886e09%3A0x7d6d8a4128fd379a!2sSinhgad%20Institute%20of%20Technology!5e0!3m2!1sen!2sin!4v1645523456789!5m2!1sen!2sin"
};

export const FAQS = [
    {
        question: "How do I register my team?",
        answer: "Public self-registration is currently closed. All squad registrations are now managed directly by the tournament administration at the venue or via official contact channels. If you are an authorized team, please reach out to our staff."
    },
    {
        question: "Is there an entry fee?",
        answer: "For GENESIS 2.0, the registration details and any associated fees are communicated directly to shortlisted teams after initial check-in. Please contact our support for current seasonal specifics."
    },
    {
        question: "Are emulators allowed?",
        answer: "No, emulators are strictly prohibited. The tournament is for mobile devices only. Any player found using an emulator will be immediately disqualified."
    },
    {
        question: "Where is the venue located?",
        answer: "The tournament is an offline event held at IIC-SIT Campus, Lonavala. You can find the exact location and directions in the 'Venue' section of this page."
    },
    {
        question: "What should I bring to the offline event?",
        answer: "Every player must bring their own mobile device, headphones, and a stable internet connection (mobile data is recommended as backup). You must also carry a valid physical ID proof."
    }
];