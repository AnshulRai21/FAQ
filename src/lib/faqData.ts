export interface FAQ {
  id: string;
  question: string;
  keywords: string[];
  answer: string;
  category: string;
}

export interface Settings {
  feesLink: string;
  helpdeskLink: string;
  boysManagerPhone: string;
  girlsManagerPhone: string;
  boysManagerName: string;
  girlsManagerName: string;
  boysManagerPhone2: string;
  boysManagerPhone3: string;
}

export const DEFAULT_FAQS: FAQ[] = [
  {
    id: 'mess-timings',
    question: 'Mess timings',
    keywords: ['mess time', 'food timing', 'breakfast lunch dinner timing', 'mess timings', 'when is food', 'meal time', 'canteen time'],
    answer: '🍽️ **Mess Timings:**\n• Breakfast: 7:00–9:00 AM\n• Lunch: 12:30–2:30 PM\n• Dinner: 7:00–9:00 PM\n\nPlease be on time — late entry may not be permitted.',
    category: 'mess',
  },
  {
    id: 'wifi-not-working',
    question: 'WiFi not working',
    keywords: ['internet issue', 'wifi problem', 'no internet', 'wifi not working', 'wifi down', 'internet not working', 'network issue'],
    answer: '📶 **WiFi Troubleshooting:**\n1. Restart your device and reconnect\n2. Forget the network and reconnect\n3. Check if others have the same issue\n4. If issue persists, contact IT Support at the hostel office or raise a complaint via GITAM Helpdesk.',
    category: 'technical',
  },
  {
    id: 'wifi-password',
    question: 'WiFi password',
    keywords: ['internet password', 'wifi login', 'wifi password', 'network password', 'wifi credentials'],
    answer: '🔐 **WiFi Credentials:**\n Gitam123$$',
    category: 'technical',
  },
  {
    id: 'leave-permission',
    question: 'Leave permission',
    keywords: ['apply leave', 'go home permission', 'leave permission', 'out pass', 'weekend leave'],
    answer: '📝 **Leave Permission Process:**\n1. Submit request through hostel portal or to your warden (at least 1 day in advance)\n2. Parental consent required — verified via helpdesk\n3. Overnight/outstation leave needs Director approval\n4. Entry must be made in outstation register\n\n⚠️ Unauthorized absence may result in disciplinary action.',
    category: 'policy',
  },
  {
    id: 'hostel-timings',
    question: 'Hostel entry/exit timings',
    keywords: ['in time', 'out time', 'entry time', 'hostel timings', 'entry exit', 'curfew'],
    answer: '🚪 **Hostel Timings:**\n• Boys: Entry restricted after 10:00 PM\n• Girls: Campus entry allowed until 9:00 PM\n• Silence hours: 10:00 PM – 7:00 AM\n\nFor late entry, prior permission from warden is mandatory.',
    category: 'policy',
  },
  {
    id: 'fees-payment',
    question: 'Hostel fees payment',
    keywords: ['pay hostel fees', 'fee payment', 'hostel fees', 'fees', 'pay fees', 'how to pay fees', 'fee portal'],
    answer: '💳 **Hostel Fees Payment:**\nPay online at: https://onlinepay.gitam.edu\n\n📋 Fee Range (approx):\n• Non-AC: ₹54,000–₹90,000/year\n• AC: ₹1,20,000–₹1,70,000/year\n\nIncludes: mess, room, WiFi, basic facilities.',
    category: 'fees',
  },
  {
    id: 'late-fee-penalty',
    question: 'Late fee penalty',
    keywords: ['missed fee deadline', 'late payment', 'fee penalty', 'overdue fees'],
    answer: '⚠️ **Late Fee Penalty:**\nLate payment penalties apply as per GITAM university rules. Check your fee schedule on the portal. Contact accounts office for waiver requests.',
    category: 'fees',
  },
  {
    id: 'room-allocation',
    question: 'Room allocation',
    keywords: ['room allotment', 'hostel room', 'room allocation', 'get room', 'room assignment'],
    answer: '🏠 **Room Allocation:**\nRooms are allocated during admission based on:\n• Availability\n• Hostel type preference\n• Sharing type: Double, Triple, Quad, or Six-sharing\n\nContact hostel office for allocation queries.',
    category: 'room',
  },
  {
    id: 'room-change',
    question: 'Room change request',
    keywords: ['change room', 'shift room', 'room transfer', 'room change'],
    answer: '🔄 **Room Change Process:**\nRoom change is permitted only with valid reasons.\n1. Submit written request to hostel warden\n2. Approval from hostel authorities required\n3. Available based on vacancy\n\nFrivolous requests may be rejected.',
    category: 'room',
  },
  {
    id: 'room-facilities',
    question: 'Room facilities',
    keywords: ['room items', 'hostel furniture', 'room facilities', 'what is in room', 'amenities'],
    answer: '🛏️ **Room Facilities Include:**\n• Bed with mattress\n• Study table and chair\n• Cupboard with lock\n• WiFi connectivity\n• Power backup\n• AC/Non-AC options available',
    category: 'room',
  },
  {
    id: 'laundry-service',
    question: 'Laundry service',
    keywords: ['washing clothes', 'laundry', 'wash clothes', 'laundry facility'],
    answer: '👕 **Laundry Facilities:**\nLaundry facilities are available within the hostel premises. Check with your hostel office for:\n• Timing schedule\n• Charges (if applicable)\n• Self-service vs. managed service',
    category: 'facilities',
  },
  {
    id: 'cleanliness-complaint',
    question: 'Cleanliness complaint',
    keywords: ['dirty room', 'unclean hostel', 'cleanliness issue', 'hygiene problem', 'dirty bathroom'],
    answer: '🧹 **Cleanliness Complaint:**\nFor cleanliness issues:\n1. Inform your floor housekeeping staff immediately\n2. Report to hostel warden if unresolved\n3. Raise formal complaint via GITAM Helpdesk\n\nExpected resolution: 24–48 hours.',
    category: 'complaint',
  },
  {
    id: 'maintenance-complaint',
    question: 'Maintenance complaint',
    keywords: ['repair issue', 'fan light problem', 'maintenance', 'broken furniture', 'electrical issue', 'plumbing'],
    answer: '🔧 **Maintenance Request:**\nFor repairs (fan, light, furniture, plumbing):\n1. Report to hostel maintenance desk\n2. Or raise a complaint via GITAM Helpdesk\n3. For urgent issues (electrical hazard, water leak) — contact warden immediately\n\nTypical response: Same day for urgent, 2–3 days for routine.',
    category: 'complaint',
  },
  {
    id: 'mess-complaint',
    question: 'Mess/food complaint',
    keywords: ['food issue', 'bad food', 'mess complaint', 'food quality', 'mess problem'],
    answer: '🍛 **Food/Mess Complaint:**\nFor food quality issues:\n1. Speak to the Mess In-Charge directly\n2. Fill complaint register at mess counter\n3. Escalate to hostel warden\n4. Use GITAM Helpdesk for formal complaint\n\nMess menu changes weekly — displayed on dining notice board.',
    category: 'complaint',
  },
  {
    id: 'emergency-contact',
    question: 'Emergency contact',
    keywords: ['emergency', 'urgent help', 'hostel manager contact', 'need immediate help', 'crisis'],
    answer: '🚨 **Emergency Protocol:**\n1. First: Use GITAM Helpdesk (0891-2840555)\n2. If unresolved: Contact hostel manager directly\n\nSee emergency contacts below.',
    category: 'emergency',
  },
  {
    id: 'hostel-security',
    question: 'Hostel security',
    keywords: ['safety', 'security guards', 'hostel security', 'cctv', 'safe'],
    answer: '🔒 **Security Measures:**\n• 24/7 security personnel on duty\n• CCTV surveillance across campus\n• Biometric/ID-based entry\n• Regular security rounds\n\nReport any suspicious activity to security desk immediately.',
    category: 'safety',
  },
  {
    id: 'medical-facility',
    question: 'Medical facility',
    keywords: ['doctor', 'health issue', 'medical', 'sick', 'hospital', 'ambulance', 'clinic'],
    answer: '🏥 **Medical Services:**\n• Campus medical clinic available\n• 24/7 ambulance service on campus\n• Basic first aid and consultation\n\nFor emergencies: Call campus security or go directly to campus clinic. Serious cases referred to nearby hospitals.',
    category: 'facilities',
  },
  {
    id: 'guest-policy',
    question: 'Guest/visitor policy',
    keywords: ['visitor', 'parents visit', 'guest policy', 'allow visitors', 'family visit'],
    answer: '👥 **Visitor Policy:**\n• Visitors allowed during designated hours only\n• Prior intimation to warden required\n• ID proof of visitor mandatory\n• Overnight guests strictly not permitted\n\nCheck with your hostel office for current visiting hours.',
    category: 'policy',
  },
  {
    id: 'ragging-policy',
    question: 'Anti-ragging policy',
    keywords: ['anti ragging', 'harassment', 'ragging', 'bullying'],
    answer: '🚫 **Anti-Ragging Policy:**\nGITAM follows ZERO TOLERANCE for ragging per UGC guidelines.\n\n• Report immediately to warden or anti-ragging committee\n• Helpline: 1800-180-5522 (UGC)\n• Anonymous reporting available\n\nOffenders face strict disciplinary action including expulsion.',
    category: 'safety',
  },
  {
    id: 'electricity-issue',
    question: 'Electricity/power issue',
    keywords: ['power cut', 'no electricity', 'power outage', 'electricity problem', 'no power'],
    answer: '⚡ **Power Issues:**\n• Hostels have power backup for common areas\n• For room-specific issues: Report to maintenance\n• Planned outages: Check hostel notice board\n\nContact hostel office or raise maintenance complaint for unresolved issues.',
    category: 'complaint',
  },
  {
    id: 'water-issue',
    question: 'Water supply issue',
    keywords: ['no water', 'water problem', 'water supply', 'water not coming'],
    answer: '💧 **Water Issues:**\n• RO drinking water available in hostels\n• For supply issues: Contact maintenance immediately\n• Timing issues: Check hostel schedule\n\nRaise a formal complaint if issue persists beyond 2 hours.',
    category: 'complaint',
  },
  {
    id: 'study-hours',
    question: 'Study/silence hours',
    keywords: ['study timing', 'quiet hours', 'study hours', 'silence time'],
    answer: '📚 **Study & Silence Hours:**\n• Silence hours: 10:00 PM – 7:00 AM\n• Study hours encouraged: 8:00 PM – 10:00 PM\n• Noise complaints during these hours taken seriously\n\nRespect your fellow students\' study time.',
    category: 'policy',
  },
  {
    id: 'internet-speed',
    question: 'Slow internet/WiFi speed',
    keywords: ['slow wifi', 'internet speed', 'slow internet', 'poor connection'],
    answer: '🐌 **Slow Internet:**\n• Speed may vary during peak hours (6–10 PM)\n• Try connecting to 5GHz band if available\n• Avoid heavy downloads during peak times\n\nFor consistently slow speeds: Contact IT support or raise complaint via helpdesk.',
    category: 'technical',
  },
  {
    id: 'night-out',
    question: 'Night out permission',
    keywords: ['stay outside', 'night leave', 'night out', 'overnight leave'],
    answer: '🌙 **Night Out Permission:**\n1. Submit request to warden 24 hours in advance\n2. Parent/guardian consent required\n3. Director approval needed for outstation\n4. Entry in outstation register mandatory\n\n⚠️ Unauthorized night out is a serious violation.',
    category: 'policy',
  },
  {
    id: 'lost-items',
    question: 'Lost items',
    keywords: ['lost things', 'missing item', 'lost and found', 'lost belongings'],
    answer: '🔍 **Lost Items:**\n• Report to hostel office immediately\n• Check lost & found register at reception\n• For valuable items: File report with hostel security\n\nGITAM is not responsible for personal belongings — use room locks.',
    category: 'general',
  },
  {
    id: 'discipline-rules',
    question: 'Hostel rules & regulations',
    keywords: ['rules', 'regulations', 'hostel rules', 'discipline'],
    answer: '📋 **Key Hostel Rules:**\n• Follow entry/exit timings strictly\n• No alcohol/smoking on campus\n• No unauthorized guests\n• Maintain cleanliness\n• Respect silence hours\n• No damage to hostel property\n\nViolations may result in disciplinary action.',
    category: 'policy',
  },
  {
    id: 'checkout-process',
    question: 'Hostel checkout process',
    keywords: ['vacate hostel', 'checkout', 'leaving hostel', 'hostel exit'],
    answer: '🚪 **Checkout Process:**\n1. Clear all dues (fees, mess, damages)\n2. Return room key to warden\n3. Get NOC from hostel office\n4. Complete checkout form\n\nEnsure room is in original condition to avoid penalty deductions.',
    category: 'policy',
  },
  {
    id: 'refund-policy',
    question: 'Hostel fee refund',
    keywords: ['hostel refund', 'fee refund', 'get money back'],
    answer: '💰 **Refund Policy:**\nRefunds are governed by GITAM university policy:\n• Depends on timing of request and academic calendar\n• Mess fee refunds for unused days may be considered\n\nContact accounts office with written request and supporting documents.',
    category: 'fees',
  },
  {
    id: 'mess-menu',
    question: 'Mess menu',
    keywords: ['food menu', 'mess menu', 'weekly menu', 'today food'],
    answer: '🍱 **Mess Menu:**\nThe weekly mess menu is displayed on the notice board in the dining area.\n\n• Non-veg served on specific days (check local notice)\n• Bengaluru campus: Non-veg thrice a week\n• Special meals on festivals\n\nFor menu changes/requests: Speak to Mess In-Charge.',
    category: 'mess',
  },
  {
    id: 'drinking-water',
    question: 'Drinking water',
    keywords: ['safe water', 'drinking water', 'ro water', 'water purifier'],
    answer: '💧 **Drinking Water:**\nRO purified drinking water is available 24/7 in all hostel blocks. Water purifier stations are located on each floor.',
    category: 'facilities',
  },
  {
    id: 'ac-rooms',
    question: 'AC room availability',
    keywords: ['air conditioning', 'ac room', 'ac hostel', 'air conditioned'],
    answer: '❄️ **AC Rooms:**\nBoth AC and Non-AC rooms are available:\n• AC rooms: Higher fee bracket\n• Non-AC: Standard pricing\n\nAC room allocation depends on availability during admission.',
    category: 'room',
  },
  {
    id: 'non-veg-food',
    question: 'Non-vegetarian food',
    keywords: ['non vegetarian', 'non veg food', 'chicken egg fish'],
    answer: '🍗 **Non-Veg Food:**\nNon-veg is served on specific designated days.\n• Bengaluru campus: Thrice a week\n• Check dining notice board for your campus schedule\n\nVegetarian options available every day.',
    category: 'mess',
  },
  {
    id: 'complaint-escalation',
    question: 'Unresolved complaint escalation',
    keywords: ['complaint unresolved', 'complaint escalation', 'not resolved', 'escalate complaint'],
    answer: '📢 **Escalation Path:**\n1. Hostel Staff → Warden → Hostel Manager\n2. GITAM Helpdesk: 0891-2840555\n3. Online: helpdesk.gitam.edu\n\nKeep complaint reference number for follow-up.',
    category: 'complaint',
  },
  {
    id: 'fees-receipt',
    question: 'Fees payment receipt',
    keywords: ['payment receipt', 'fee receipt', 'download receipt'],
    answer: '🧾 **Payment Receipt:**\nDownload your fee receipt from:\nhttps://onlinepay.gitam.edu\n\nLogin with your student credentials → Payments → Download Receipt.',
    category: 'fees',
  },
  {
    id: 'internet-restrictions',
    question: 'Blocked/restricted websites',
    keywords: ['blocked sites', 'restricted websites', 'website blocked'],
    answer: '🚫 **Internet Restrictions:**\nCertain websites and content categories are restricted per university policy. For legitimate academic needs, contact IT support for whitelist requests.',
    category: 'technical',
  },
  {
    id: 'parking-facility',
    question: 'Vehicle parking',
    keywords: ['vehicle parking', 'bike parking', 'car parking', 'park vehicle'],
    answer: '🚗 **Parking Facilities:**\nParking available as per hostel rules:\n• Registration with hostel office required\n• Space allocated based on availability\n• Security responsible only during designated hours',
    category: 'facilities',
  },
  {
    id: 'sports-facilities',
    question: 'Sports & recreation facilities',
    keywords: ['games', 'sports', 'gym', 'recreation', 'indoor games'],
    answer: '🏸 **Sports & Facilities:**\n• Indoor gym access for hostellers\n• Badminton court\n• TV room in common area\n• Campus sports grounds\n• Complimentary bus service on weekdays and weekends',
    category: 'facilities',
  },
  {
    id: 'library-access',
    question: 'Library access',
    keywords: ['library timing', 'library access', 'study library'],
    answer: '📖 **Library:**\nLibrary access as per university schedule.\n• Check academic calendar for timings\n• Student ID mandatory for entry\n• Extended hours during exam periods',
    category: 'facilities',
  },
  {
    id: 'internet-login-issue',
    question: 'WiFi/internet login issue',
    keywords: ['wifi login problem', 'internet login', 'cannot login wifi', 'wifi credential error'],
    answer: '🔑 **WiFi Login Issues:**\n1. Verify username and password (case-sensitive)\n2. Try password reset on GITAM portal\n3. Check if account is active\n4. Contact IT Support: Visit hostel IT desk or helpdesk\n\nDefault credentials are your enrollment number and date of birth.',
    category: 'technical',
  },
  {
    id: 'room-sharing',
    question: 'Room sharing types',
    keywords: ['sharing room', 'room sharing', 'sharing options', 'double triple'],
    answer: '🛏️ **Room Sharing Options:**\n• Double sharing (2 students)\n• Triple sharing (3 students)\n• Quad sharing (4 students)\n• Six sharing (6 students)\n\nFee varies by sharing type. Single rooms available on request (limited).',
    category: 'room',
  },
  {
    id: 'hostel-attendance',
    question: 'Hostel attendance',
    keywords: ['hostel attendance', 'attendance rules', 'attendance register'],
    answer: '📊 **Hostel Attendance:**\nAttendance may be taken as per hostel policy.\n• Regular presence expected\n• Extended absence requires formal leave approval\n• Report absences to warden in advance',
    category: 'policy',
  },
  {
    id: 'holiday-rules',
    question: 'Holiday/vacation hostel rules',
    keywords: ['vacation rules', 'holiday hostel', 'semester break'],
    answer: '🏖️ **Holiday Rules:**\nSpecial rules apply during semester breaks:\n• Advance notice required for staying during vacations\n• Reduced mess services possible\n• Security protocols remain active\n\nContact hostel office for vacation stay approval.',
    category: 'policy',
  },
  {
    id: 'helpdesk',
    question: 'GITAM Helpdesk',
    keywords: ['helpdesk', 'support', 'gitam helpdesk', 'contact gitam', 'help desk'],
    answer: '📞 **GITAM Helpdesk:**\n• Phone: 0891-2840555\n• Online: helpdesk.gitam.edu\n• Available during office hours\n\nFor hostel-specific issues, also contact your hostel warden directly.',
    category: 'general',
  },
];

export const DEFAULT_SETTINGS: Settings = {
  feesLink: 'https://onlinepay.gitam.edu',
  helpdeskLink: 'https://helpdesk.gitam.edu',
  boysManagerPhone: '+919010306158',
  girlsManagerPhone: '+919866577788',
  boysManagerName: 'Boys Hostel',
  girlsManagerName: 'Girls Hostel',
  boysManagerPhone2: '+919177755341',
  boysManagerPhone3: '+919542055577',
};

export const QUICK_CHIPS = [
  { label: '🍽️ Mess Timings', query: 'mess timings' },
  { label: '📶 WiFi Issue', query: 'wifi not working' },
  { label: '📝 Leave Permission', query: 'leave permission' },
  { label: '💳 Fees Payment', query: 'hostel fees payment' },
  { label: '🚨 Complaint', query: 'how to raise hostel complaint' },
  { label: '📞 Emergency', query: 'emergency contact' },
];

export const SUGGESTION_POOL = [
  'Mess timings?',
  'WiFi not working',
  'Leave permission',
  'Hostel fees?',
  'Room facilities',
  'Emergency contact',
  'Maintenance issue',
  'Night out permission',
  'Mess menu today?',
  'Study hours?',
  'Medical facility',
  'Anti-ragging policy',
  'Water issue',
  'Electricity problem',
  'Room change request',
];
