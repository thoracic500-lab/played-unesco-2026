/* ============================================================
   PLAYED — real-cases.js
   The Hall of Lies: documented misinformation cases, plus a set
   of true-but-wild stories (because cynicism is not literacy).
   Every entry is a real, publicly documented case. Descriptions
   are paraphrased; no fabricated sources.
   Fields: title · year · region · country · lat/lon (approx, for
   the globe) · type · claim (as it circulated) · verdict ·
   truth (what verification found) · src (who documented it)
   ============================================================ */

window.REAL_CASES = [

  /* ---------------- health ---------------- */
  {
    title: "Bleach “miracle cure”", platform: "youtube", year: "2010s–2020", region: "Global", country: "Global", lat: 10, lon: -30, type: "health",
    claim: "“Miracle Mineral Solution” (chlorine dioxide — industrial bleach) cures autism, malaria and COVID-19.",
    verdict: "FAKE", truth: "MMS is a bleach. Regulators warned it causes vomiting, liver failure and death. No curative effect on anything.",
    src: "US FDA public warnings; prosecutions of sellers"
  },
  {
    title: "5G towers cause COVID", platform: "facebook", year: "2020", region: "Europe", country: "United Kingdom", lat: 53.4, lon: -2.9, type: "health",
    claim: "COVID-19 symptoms are actually radiation sickness from new 5G masts. The pandemic is a cover story.",
    verdict: "FAKE", truth: "Viruses cannot travel on radio waves; the virus spread in countries with no 5G at all. The rumour led to dozens of real arson attacks on UK phone masts.",
    src: "WHO myth-busters; UK court cases on mast arson"
  },
  {
    title: "“Nature’s Ozempic”", platform: "tiktok", year: "2023–2024", region: "Global", country: "Global (TikTok)", lat: 34, lon: -118, type: "health",
    claim: "The supplement berberine is a natural, side-effect-free alternative to Ozempic for dramatic weight loss.",
    verdict: "MISLEADING", truth: "Berberine shows modest metabolic effects in small studies — nothing close to GLP-1 drugs. Clinicians warned about unregulated dosing and false equivalence.",
    src: "Coverage by AP, health fact-checkers, endocrinologists"
  },
  {
    title: "Wakefield vaccine–autism study", platform: "web", year: "1998", region: "Europe", country: "United Kingdom", lat: 51.5, lon: -0.12, type: "health",
    claim: "A Lancet study of 12 children proves the MMR vaccine causes autism.",
    verdict: "FAKE", truth: "The study was retracted for data manipulation and undisclosed financial conflicts; Wakefield lost his medical licence. Dozens of large studies since found no link — but the lie still fuels outbreaks.",
    src: "The Lancet retraction (2010); UK General Medical Council"
  },
  {
    title: "“Plandemic” video", platform: "youtube", year: "2020", region: "N. America", country: "United States", lat: 34.05, lon: -118.2, type: "health",
    claim: "A slickly produced ‘documentary’ claims the pandemic was planned by elites and masks ‘activate’ the virus.",
    verdict: "FAKE", truth: "A case study in false authority: one discredited researcher presented as a silenced whistleblower. Every major claim was debunked; platforms removed it after ~8M views in days.",
    src: "Science magazine breakdown; platform takedown notices"
  },
  {
    title: "Turmeric cures cancer", platform: "facebook", year: "recurring", region: "Asia", country: "India", lat: 20.6, lon: 79, type: "health",
    claim: "Doctors are hiding it: turmeric (or lemon, or alkaline water) cures cancer better than chemotherapy.",
    verdict: "FAKE", truth: "Curcumin shows some lab-dish activity but no clinical trial has shown it cures cancer. Patients who delay real treatment for ‘natural cures’ have measurably worse survival rates.",
    src: "Cancer Research UK; peer-reviewed oncology reviews"
  },
  {
    title: "Hydroxychloroquine hype", platform: "x", year: "2020", region: "Global", country: "Global", lat: -14, lon: -52, type: "health",
    claim: "A cheap malaria drug is a suppressed miracle cure for COVID-19.",
    verdict: "FAKE", truth: "Large randomized trials (RECOVERY, WHO Solidarity) found no benefit for COVID treatment. The original hype rested on a tiny, flawed, later-questioned study.",
    src: "RECOVERY trial; WHO Solidarity trial results"
  },

  /* ---------------- climate & disaster ---------------- */
  {
    title: "The flood shark", platform: "x", year: "2011 → today", region: "N. America", country: "United States", lat: 29.7, lon: -95.3, type: "climate",
    claim: "“Shark swimming on a flooded highway” photo, reposted as breaking news after nearly every major flood.",
    verdict: "FAKE", truth: "One photoshopped image from 2011, recycled for over a decade across dozens of storms. The most reverse-image-searched hoax in fact-checking history.",
    src: "Snopes; AP fact checks (many editions)"
  },
  {
    title: "Hurricane Helene AI girl", platform: "facebook", year: "2024", region: "N. America", country: "United States", lat: 35.6, lon: -82.6, type: "ai",
    claim: "Photo of a crying girl clutching a puppy in a rescue boat, used to attack the disaster response.",
    verdict: "FAKE", truth: "AI-generated: inconsistent fingers and boat details, no photographer, no agency. Notably, some sharers kept it up even after learning it was fake — ‘it captures the mood’.",
    src: "AFP, BBC Verify and AP debunks, Oct 2024"
  },
  {
    title: "“15-minute city” prisons", platform: "facebook", year: "2023", region: "Europe", country: "United Kingdom", lat: 51.75, lon: -1.26, type: "conspiracy",
    claim: "Oxford’s 15-minute-city urban plan will lock residents into zones — ‘climate lockdown’ with permits to leave.",
    verdict: "FAKE", truth: "The plan was routine traffic-filter policy: no movement restrictions of any kind. The conspiracy version triggered street protests and harassment of local councillors.",
    src: "Reuters & Full Fact debunks; Oxfordshire council statements"
  },
  {
    title: "“200 arsonists” bushfires", platform: "x", year: "2020", region: "Oceania", country: "Australia", lat: -33.8, lon: 151.2, type: "climate",
    claim: "Australia’s Black Summer fires were set by ~200 arsonists — climate change had nothing to do with it.",
    verdict: "MISLEADING", truth: "The number bundled unrelated minor offences across a year. Fire agencies attributed the megafires mainly to lightning in drought conditions; bot-like accounts amplified the arson framing.",
    src: "Police statements; QUT bot-activity analysis"
  },
  {
    title: "Maui “energy weapon” fires", platform: "instagram", year: "2023", region: "N. America", country: "United States (Hawaii)", lat: 20.9, lon: -156.5, type: "conspiracy",
    claim: "Photos ‘prove’ the Lahaina wildfire was started by a directed-energy weapon to clear land.",
    verdict: "FAKE", truth: "The ‘beam’ photos were old images from other events or lens flares. Investigators traced the fire to downed power lines in hurricane-force winds.",
    src: "AP, Reuters fact checks; official fire investigation"
  },
  {
    title: "Valencia flood rumours", platform: "whatsapp", year: "2024", region: "Europe", country: "Spain", lat: 39.47, lon: -0.38, type: "climate",
    claim: "Authorities are hiding thousands of bodies in a flooded car-park; dam releases, not rain, caused the disaster.",
    verdict: "FAKE", truth: "Divers searched the garage — the rumoured hidden victims did not exist. The DANA rainfall event was real and extensively measured. Rumours measurably disrupted rescue work.",
    src: "Spanish emergency services; Maldita.es and EFE Verifica"
  },
  {
    title: "Cherry-picked cooling graphs", platform: "facebook", year: "recurring", region: "Global", country: "Global", lat: 64, lon: -19, type: "climate",
    claim: "Charts starting at the exceptional 1998 El Niño ‘prove’ the planet has been cooling ever since.",
    verdict: "MISLEADING", truth: "Textbook cherry-picking: pick a record-hot start year, ignore the trend. Every decade since has been hotter than the last; the ten warmest years on record are all recent.",
    src: "NASA GISS / NOAA temperature records"
  },
  {
    title: "Wind turbines kill the whales", platform: "facebook", year: "2023", region: "N. America", country: "United States", lat: 39.4, lon: -74.5, type: "climate",
    claim: "Offshore wind farm surveys are causing a wave of whale deaths along the US East Coast.",
    verdict: "FAKE", truth: "NOAA found no link to wind development; necropsies pointed to ship strikes and entanglement. The narrative was heavily promoted by fossil-fuel-aligned groups.",
    src: "NOAA statements; AP investigation of funding networks"
  },

  /* ---------------- AI & synthetic media ---------------- */
  {
    title: "Pentagon explosion image", platform: "x", year: "2023", region: "N. America", country: "United States", lat: 38.87, lon: -77.05, type: "ai",
    claim: "“Large explosion near the Pentagon” — image spread by verified accounts, briefly moving the stock market.",
    verdict: "FAKE", truth: "AI-generated: the building facade and fence melt into each other. No local reports, no emergency response, no second photo — a real explosion produces hundreds of witnesses.",
    src: "Arlington Fire Dept statement; extensive newsroom debunks"
  },
  {
    title: "Pope in the puffer jacket", platform: "x", year: "2023", region: "Europe", country: "Vatican", lat: 41.9, lon: 12.45, type: "ai",
    claim: "Photo of Pope Francis strolling in a white designer puffer coat.",
    verdict: "FAKE", truth: "Midjourney image; the tell was the melted crucifix and hand. Harmless as memes go — but it marked the moment AI photos fooled millions who ‘knew better’.",
    src: "Creator interview; universal fact-check coverage"
  },
  {
    title: "Trump arrest photos", platform: "x", year: "2023", region: "N. America", country: "United States", lat: 40.7, lon: -74, type: "ai",
    claim: "Dramatic photos of Donald Trump being tackled and dragged away by police.",
    verdict: "FAKE", truth: "Openly created with Midjourney by a journalist as a demonstration — then stripped of context and shared as real. Garbled faces and impossible limbs give it away.",
    src: "Creator (E. Higgins/Bellingcat) disclosure; AP debunk"
  },
  {
    title: "AI Taylor Swift endorsement", platform: "x", year: "2024", region: "N. America", country: "United States", lat: 36.16, lon: -86.78, type: "ai",
    claim: "AI images of Taylor Swift and fans in “Swifties for Trump” shirts, shared as evidence of an endorsement.",
    verdict: "FAKE", truth: "Synthetic images; the singer later cited exactly this episode when publishing her actual, opposite endorsement — a rare case of a deepfake backfiring.",
    src: "Newsroom debunks; Swift’s own statement, Sept 2024"
  },
  {
    title: "Biden robocall, New Hampshire", platform: "web", year: "2024", region: "N. America", country: "United States", lat: 43.2, lon: -71.5, type: "ai",
    claim: "A robocall in President Biden’s voice tells Democrats not to vote in the primary — ‘save your vote for November’.",
    verdict: "FAKE", truth: "A voice deepfake commissioned by a political consultant, generated for a few dollars. It led to a $6M FCC fine, criminal charges, and a US ban on AI-voice robocalls.",
    src: "FCC enforcement action; NH Attorney General"
  },
  {
    title: "“Ghost of Kyiv” ace", platform: "youtube", year: "2022", region: "Europe", country: "Ukraine", lat: 50.45, lon: 30.52, type: "conflict",
    claim: "Video shows a legendary Ukrainian pilot downing six Russian jets in the war’s first hours.",
    verdict: "FAKE", truth: "The viral clip was from the video game Digital Combat Simulator. The Ukrainian Air Force itself later clarified the ‘Ghost’ was a morale myth, not one real pilot.",
    src: "Ukrainian Air Force statement; game-footage matches"
  },
  {
    title: "Zelensky “surrender” deepfake", platform: "facebook", year: "2022", region: "Europe", country: "Ukraine", lat: 50.45, lon: 30.52, type: "ai",
    claim: "Video of President Zelensky telling Ukrainian soldiers to lay down their arms, planted on a hacked news site.",
    verdict: "FAKE", truth: "A crude early deepfake — mismatched head-to-body scale and a frozen torso. Debunked within hours because Ukraine had pre-warned citizens such a fake was coming: prebunking at work.",
    src: "Meta/platform removals; Ukraine’s advance warnings"
  },
  {
    title: "Slovak election audio", platform: "facebook", year: "2023", region: "Europe", country: "Slovakia", lat: 48.15, lon: 17.1, type: "ai",
    claim: "Leaked audio of candidate Michal Šimečka ‘discussing how to buy votes’, released 48h before the election.",
    verdict: "FAKE", truth: "An AI voice clone, timed inside the pre-election silence window when media couldn’t debunk loudly. Considered one of the first deepfakes to plausibly touch a national election result.",
    src: "AFP & Denník N forensic analysis"
  },

  /* ---------------- scams targeting youth ---------------- */
  {
    title: "“$500/day” task scams", platform: "telegram", year: "2023–2025", region: "Global", country: "Global (Telegram/WhatsApp)", lat: 1.35, lon: 103.8, type: "scam",
    claim: "Work from home ‘liking videos’ or ‘boosting products’ for $500/day — scan the QR code, small deposit required to unlock earnings.",
    verdict: "FAKE", truth: "The classic task scam: small early payouts build trust, then victims ‘deposit’ to unlock bigger tiers and lose everything. Job scams are among the top fraud categories reported by under-30s.",
    src: "US FTC consumer alerts; Interpol advisories"
  },
  {
    title: "Elon Musk crypto giveaway", platform: "x", year: "2020–2022", region: "Global", country: "Global", lat: 37.77, lon: -122.4, type: "scam",
    claim: "“Send 0.1 BTC, receive 0.2 back” — posted from hacked verified accounts including Musk, Obama and Apple.",
    verdict: "FAKE", truth: "The July 2020 Twitter breach ran exactly this scam from 130 hijacked celebrity accounts. No giveaway ever pays back double. Ever.",
    src: "Twitter incident report; US DOJ prosecutions"
  },
  {
    title: "Deepfaked celebrity investments", platform: "facebook", year: "2023–2025", region: "Europe", country: "United Kingdom", lat: 51.5, lon: -0.12, type: "scam",
    claim: "Video ads show trusted figures (e.g., finance journalist Martin Lewis) endorsing a ‘wealth-building AI platform’.",
    verdict: "FAKE", truth: "Deepfaked ads Lewis called ‘frightening’ — he never endorses products. The scam pattern lost UK victims tens of millions before ad networks reacted.",
    src: "Martin Lewis / MoneySavingExpert warnings; UK FCA alerts"
  },
  {
    title: "Pig-butchering romance funds", platform: "telegram", year: "2022–2025", region: "Asia", country: "SE Asia (global victims)", lat: 16.8, lon: 96.15, type: "scam",
    claim: "A charming online stranger slowly introduces you to their ‘uncle’s’ crypto platform showing guaranteed daily returns.",
    verdict: "FAKE", truth: "Industrial-scale fraud run from compound call-centres; the ‘platform’ is a dashboard mock-up. Losses exceed billions annually; the scammers are often trafficking victims themselves.",
    src: "UNODC reports; FBI IC3 statistics"
  },
  {
    title: "Government grant DMs", platform: "whatsapp", year: "recurring", region: "Africa", country: "Nigeria (pattern is global)", lat: 9.06, lon: 7.49, type: "scam",
    claim: "“The government is giving ₦50,000 lockdown grants — register through this link before Friday.”",
    verdict: "FAKE", truth: "Phishing kits harvesting bank and identity details, localized to whichever country and currency you live in. Real grants are never distributed via forwarded chat links.",
    src: "National CERT advisories; local fact-checkers (Africa Check)"
  },

  /* ---------------- elections & civic life ---------------- */
  {
    title: "Sharpiegate", platform: "facebook", year: "2020", region: "N. America", country: "United States", lat: 33.45, lon: -112.07, type: "election",
    claim: "Arizona poll workers handed Trump voters Sharpies so machines would reject their ballots.",
    verdict: "FAKE", truth: "County officials confirmed Sharpie-marked ballots were counted normally — machines read them fine. The claim spawned protests at counting centres anyway.",
    src: "Maricopa County officials; court dismissals"
  },
  {
    title: "Brazil voting machines", platform: "whatsapp", year: "2022", region: "S. America", country: "Brazil", lat: -15.79, lon: -47.88, type: "election",
    claim: "Brazil’s electronic voting machines are unauditable and were rigged against Bolsonaro.",
    verdict: "FAKE", truth: "Machines are publicly tested and audited; military-requested reviews found no fraud. The narrative fuelled the storming of Brazil’s Congress on 8 January 2023.",
    src: "TSE audits; military report; Supreme Court proceedings"
  },
  {
    title: "Kenya’s fake BBC graphics", platform: "whatsapp", year: "2022", region: "Africa", country: "Kenya", lat: -1.29, lon: 36.82, type: "election",
    claim: "Polished ‘BBC’ and ‘Reuters’ video graphics predicting election winners circulated on WhatsApp and Twitter.",
    verdict: "FAKE", truth: "Neither outlet produced them — logos were stolen to borrow credibility. Kenya has become a case study in ‘imposter content’ around elections.",
    src: "BBC & Reuters disavowals; Code for Africa analyses"
  },
  {
    title: "“Eating the pets”", platform: "x", year: "2024", region: "N. America", country: "United States", lat: 39.92, lon: -83.81, type: "election",
    claim: "Haitian migrants in Springfield, Ohio are stealing and eating residents’ cats and dogs.",
    verdict: "FAKE", truth: "City officials and police found zero credible reports. The rumour — amplified from a debate stage — led to bomb threats that closed local schools and hospitals.",
    src: "Springfield city officials; police statements"
  },
  {
    title: "Southport attacker rumours", platform: "x", year: "2024", region: "Europe", country: "United Kingdom", lat: 53.65, lon: -3, type: "conflict",
    claim: "A false name and ‘asylum-seeker Muslim migrant’ identity for the Southport attacker, spread within hours.",
    verdict: "FAKE", truth: "The invented identity — boosted by high-follower accounts — helped ignite riots across England before courts took the rare step of releasing the real suspect’s details early.",
    src: "UK courts & police; post-riot parliamentary review"
  },
  {
    title: "Dead voters lists", platform: "facebook", year: "2020, recycled", region: "N. America", country: "United States", lat: 42.33, lon: -83.05, type: "election",
    claim: "Viral spreadsheets of ‘thousands of dead people who voted’ in swing states.",
    verdict: "FAKE", truth: "Audits matching the lists against records found the ‘dead voters’ were alive, were different people with the same name, or hadn’t voted. Isolated real cases number in the dozens, not thousands.",
    src: "State audits; court rulings (60+ cases dismissed)"
  },
  {
    title: "WhatsApp kidnapper rumours", platform: "whatsapp", year: "2018", region: "Asia", country: "India", lat: 17.38, lon: 78.48, type: "conflict",
    claim: "Forwarded videos warn of child-kidnapping gangs operating in your district — ‘be alert, share to all groups’.",
    verdict: "FAKE", truth: "The ‘kidnapping’ clip was a doctored child-safety PSA from Pakistan. The rumours triggered mob lynchings of innocent travellers; WhatsApp added forward limits in response.",
    src: "Indian police investigations; WhatsApp policy changes"
  },
  {
    title: "Myanmar hate campaign", platform: "facebook", year: "2017", region: "Asia", country: "Myanmar", lat: 19.75, lon: 96.1, type: "conflict",
    claim: "Coordinated Facebook posts painted the Rohingya minority as an existential threat, dressed up as news.",
    verdict: "FAKE", truth: "UN investigators concluded the platform played a ‘determining role’ in inciting violence. The gravest documented case of what unchecked amplification can cost.",
    src: "UN Human Rights Council fact-finding mission"
  },
  {
    title: "Litter boxes in schools", platform: "facebook", year: "2022", region: "N. America", country: "United States", lat: 39.74, lon: -104.98, type: "conspiracy",
    claim: "Schools are placing litter boxes in bathrooms for students who identify as cats.",
    verdict: "FAKE", truth: "No school ever did this. Checked in dozens of districts; every named school denied it. A pure outrage-bait fabrication that reached national politicians.",
    src: "NBC News investigation across 20+ districts"
  },
  {
    title: "Wayfair cabinet trafficking", platform: "instagram", year: "2020", region: "N. America", country: "United States", lat: 42.36, lon: -71.06, type: "conspiracy",
    claim: "Overpriced cabinets named after missing children ‘prove’ a furniture site ships trafficked kids.",
    verdict: "FAKE", truth: "Pricing glitches plus name coincidences. Anti-trafficking organizations begged people to stop: the viral panic flooded hotlines and diverted resources from real victims.",
    src: "Polaris Project (human-trafficking hotline) statements"
  },
  {
    title: "Bill Gates microchip vaccines", platform: "facebook", year: "2020", region: "Global", country: "Global", lat: 47.6, lon: -122.3, type: "conspiracy",
    claim: "COVID vaccines contain microchips so Bill Gates can track the population.",
    verdict: "FAKE", truth: "Born from twisting a quote about digital health certificates. No injectable tracking chip compatible with a syringe exists; your phone already tracks you better than any chip could.",
    src: "Reuters/AP debunks; origin traced by BBC"
  },

  /* ---------------- South Asia / Bangladesh ---------------- */
  {
    title: "Padma Bridge “heads” rumour", platform: "facebook", year: "2019", region: "Asia", country: "Bangladesh", lat: 23.44, lon: 90.26, type: "conspiracy",
    claim: "The under-construction Padma Bridge ‘needs human heads’ for its foundation — beware of child kidnappers collecting them.",
    verdict: "FAKE", truth: "A centuries-old construction myth revived on Facebook. There was no kidnapping wave — but mobs lynched at least eight innocent people, including Taslima Begum Renu, a mother visiting a school. Police ran national campaigns to stop the rumour.",
    src: "Bangladesh Police; BBC Bangla; AFP fact checks (2019)"
  },
  {
    title: "Bangladesh election deepfakes", platform: "facebook", year: "2023–24", region: "Asia", country: "Bangladesh", lat: 23.8, lon: 90.41, type: "ai",
    claim: "AI-generated videos and audio of opposition politicians — fabricated statements, and a fake swimsuit photo of a female MP — spread before the January 2024 election.",
    verdict: "FAKE", truth: "Documented deepfakes, some made with commercial tools costing a few dollars a month, disproportionately targeting women in politics. Flagged internationally as an early warning for AI in South Asian elections.",
    src: "Financial Times investigation; AFP; Dismislab (Dhaka)"
  },
  {
    title: "Thankuni-leaf COVID “cure”", platform: "facebook", year: "2020", region: "Asia", country: "Bangladesh", lat: 24.37, lon: 91.42, type: "health",
    claim: "Eat thankuni (pennywort) leaves before sunrise and coronavirus can’t touch you — spread across the country in a single night.",
    verdict: "FAKE", truth: "A midnight chain rumour carried by phone calls and Facebook in March 2020, traced back to a ‘dream’ story. No herb prevents COVID-19 — but that week the rumour out-ran every official health message in Bangladesh.",
    src: "Rumor Scanner & BOOM Bangladesh; Dhaka Tribune"
  },
  {
    title: "Rohingya crisis recycled photos", platform: "facebook", year: "2017", region: "Asia", country: "Myanmar / Bangladesh", lat: 21.43, lon: 92.01, type: "conflict",
    claim: "Graphic photos circulated as ‘proof’ of atrocities during the Rohingya crisis — shared millions of times.",
    verdict: "MISLEADING", truth: "Many of the most viral images were real tragedies from other countries and decades, recycled to inflame all sides. The crisis itself was horrifically real — and the recycled photos handed deniers ammunition to dismiss authentic evidence.",
    src: "AFP & BBC photo verifications (2017)"
  },
  {
    title: "‘Morphed photo’ abuse of women", platform: "facebook", year: "ongoing", region: "Asia", country: "Bangladesh & South Asia", lat: 23.8, lon: 90.4, type: "ai",
    claim: "A ‘leaked’ or ‘real character’ photo of a named woman, spread in community and family groups — often around a marriage or dowry dispute — to shame her.",
    verdict: "FAKE", truth: "A documented, widespread pattern: the images are almost always morphed or AI-generated. Cyber-crime units and women’s-rights groups record it as image-based abuse used to blackmail, shame and coerce women — and it has driven real harassment and suicides. Spreading such an image is itself a criminal offence, not ‘just gossip’. The literacy move: assume ‘leaked’ photos are fake, refuse to spread them, defend the target, and report.",
    src: "Bangladesh Police Cyber units; UN Women; news reporting on image-based abuse"
  },

  /* ---------------- true but wild (cynicism ≠ literacy) ---------------- */
  {
    title: "The Dhaka packet that saved 50M lives", platform: "web", year: "1968 → today", region: "Asia", country: "Bangladesh", lat: 23.7, lon: 90.35, type: "true",
    claim: "A packet of sugar, salt and clean water, developed in Dhaka, has saved more than 50 million lives worldwide.",
    verdict: "TRUE", truth: "Oral rehydration solution was proven in Dhaka’s cholera hospitals (icddr,b) and carried village-to-village by Bangladeshi community health workers. The Lancet called it ‘potentially the most important medical advance of this century’.",
    src: "icddr,b; WHO; The Lancet (1978)"
  },
  {
    title: "NASA moved an asteroid", platform: "web", year: "2022", region: "Global", country: "United States", lat: 28.5, lon: -80.6, type: "true",
    claim: "NASA deliberately crashed a spacecraft into an asteroid and changed its orbit.",
    verdict: "TRUE", truth: "The DART mission struck Dimorphos and shortened its orbit by ~32 minutes — humanity’s first planetary-defence test. Sounds like sci-fi; fully documented.",
    src: "NASA DART mission results, confirmed by telescopes worldwide"
  },
  {
    title: "Japan’s upside-down Moon lander", platform: "web", year: "2024", region: "Asia", country: "Japan", lat: 35.68, lon: 139.7, type: "true",
    claim: "Japan landed on the Moon… nose-down, and the lander still phoned home.",
    verdict: "TRUE", truth: "JAXA’s SLIM tipped onto its nose on landing yet survived multiple lunar nights. The absurd-looking photo is genuine.",
    src: "JAXA mission updates and images"
  },
  {
    title: "46,000-year-old worm revived", platform: "web", year: "2023", region: "Europe", country: "Russia (Siberia)", lat: 62, lon: 130, type: "true",
    claim: "Scientists revived a roundworm frozen in Siberian permafrost since the Ice Age — and it had babies.",
    verdict: "TRUE", truth: "Published, peer-reviewed cryptobiosis research. A headline that pattern-matches to fake — and is real.",
    src: "PLOS Genetics (2023)"
  },
  {
    title: "Sweden pays grandparents", platform: "web", year: "2024", region: "Europe", country: "Sweden", lat: 59.33, lon: 18.07, type: "true",
    claim: "Sweden now lets parents transfer paid parental leave to grandparents who babysit.",
    verdict: "TRUE", truth: "Law in force since July 2024 — parents can transfer allowance days to other insured caregivers, including grandparents.",
    src: "Swedish Social Insurance Agency (Försäkringskassan)"
  },
  {
    title: "The cooling-centre thread", platform: "x", year: "recurring", region: "Global", country: "Everywhere", lat: 45.5, lon: -73.6, type: "true",
    claim: "“City opens free cooling centres during the heatwave — locations in thread, please share.”",
    verdict: "TRUE", truth: "Verified official accounts + local news corroboration + current heat warning = true and worth spreading. Guardianship means helping true information travel, too.",
    src: "Standard municipal emergency communications"
  },
  {
    title: "Octopus punches fish", platform: "web", year: "2020", region: "Africa", country: "Red Sea", lat: 27, lon: 34, type: "true",
    claim: "Octopuses on group hunts sometimes punch their fish hunting partners, seemingly out of spite.",
    verdict: "TRUE", truth: "Documented on camera by marine biologists studying collaborative hunting. Peer-reviewed, hilarious, real.",
    src: "Ecology (journal), 2020 field study"
  },
];

/* real platform marks (simplified official glyphs, inline SVG, currentColor) */
window.PLATFORM_ICONS = {
  facebook: `<svg class="picon" viewBox="0 0 24 24" aria-label="Facebook" role="img"><path fill="currentColor" d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.4v7A10 10 0 0 0 22 12z"/></svg>`,
  x: `<svg class="picon" viewBox="0 0 24 24" aria-label="X (Twitter)" role="img"><path fill="currentColor" d="M18.9 1.2h3.7l-8.1 9.3 9.5 12.3h-7.5l-5.8-7.6-6.7 7.6H.3l8.6-9.9L0 1.2h7.7l5.3 6.9 5.9-6.9zm-1.3 19.5h2L6.6 3.3H4.4l13.2 17.4z"/></svg>`,
  whatsapp: `<svg class="picon" viewBox="0 0 24 24" aria-label="WhatsApp" role="img"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2zm5.5 14.2c-.2.7-1.3 1.3-1.9 1.4-.5.1-1.1.2-3.4-.7-2.9-1.2-4.7-4.1-4.9-4.3-.1-.2-1.1-1.5-1.1-2.9s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.9 2.1c.1.2.1.4 0 .6l-.4.6-.5.5c-.2.2-.3.4-.1.7.2.4.8 1.4 1.8 2.2 1.2 1.1 2.2 1.4 2.6 1.6.3.1.5.1.7-.1l1-1.2c.2-.3.5-.2.7-.1l2.1 1c.3.2.5.3.6.4 0 .2 0 .7-.2 1.3z"/></svg>`,
  telegram: `<svg class="picon" viewBox="0 0 24 24" aria-label="Telegram" role="img"><path fill="currentColor" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm4.9 6.9-1.7 8c-.1.6-.5.7-1 .4l-2.6-1.9-1.2 1.2c-.2.2-.3.3-.6.3l.2-2.7 4.9-4.4c.2-.2 0-.3-.3-.1l-6.1 3.8-2.6-.8c-.6-.2-.6-.6.1-.9l10.2-3.9c.5-.2.9.1.7 1z"/></svg>`,
  youtube: `<svg class="picon" viewBox="0 0 24 24" aria-label="YouTube" role="img"><path fill="currentColor" d="M23.5 6.2a3 3 0 0 0-2.1-2.2C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8zM9.5 15.6V8.4L15.8 12l-6.3 3.6z"/></svg>`,
  instagram: `<svg class="picon" viewBox="0 0 24 24" aria-label="Instagram" role="img"><path fill="currentColor" d="M12 2.2c3.2 0 3.6 0 4.9.1 3.3.1 4.8 1.7 4.9 4.9.1 1.3.1 1.6.1 4.8s0 3.6-.1 4.8c-.1 3.2-1.7 4.8-4.9 4.9-1.3.1-1.6.1-4.9.1s-3.6 0-4.8-.1c-3.3-.1-4.8-1.7-4.9-4.9-.1-1.2-.1-1.6-.1-4.8s0-3.6.1-4.8C2.4 4 4 2.4 7.2 2.3c1.2-.1 1.6-.1 4.8-.1zm0 4.4a5.4 5.4 0 1 0 0 10.8 5.4 5.4 0 0 0 0-10.8zm0 8.9a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7zm5.6-9.1a1.3 1.3 0 1 0 0-2.5 1.3 1.3 0 0 0 0 2.5z"/></svg>`,
  tiktok: `<svg class="picon" viewBox="0 0 24 24" aria-label="TikTok" role="img"><path fill="currentColor" d="M19.6 6.7a4.8 4.8 0 0 1-3.8-4.5V2h-3.3v13.7a2.9 2.9 0 1 1-2-2.7V9.6a6.2 6.2 0 1 0 5.3 6.1V8.9a8 8 0 0 0 4.4 1.3V6.9l-.6-.2z"/></svg>`,
  web: `<svg class="picon" viewBox="0 0 24 24" aria-label="Web" role="img"><path fill="currentColor" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm7.9 9h-3.4a15.7 15.7 0 0 0-1.2-5.7A8 8 0 0 1 19.9 11zM12 4c.9 0 2.4 2.6 2.7 7H9.3C9.6 6.6 11.1 4 12 4zM8.7 5.3A15.7 15.7 0 0 0 7.5 11H4.1a8 8 0 0 1 4.6-5.7zM4.1 13h3.4c.1 2.1.5 4.1 1.2 5.7A8 8 0 0 1 4.1 13zM12 20c-.9 0-2.4-2.6-2.7-7h5.4c-.3 4.4-1.8 7-2.7 7zm3.3-1.3a15.7 15.7 0 0 0 1.2-5.7h3.4a8 8 0 0 1-4.6 5.7z"/></svg>`,
};
window.PLATFORM_NAMES = { facebook: "Facebook", x: "X", whatsapp: "WhatsApp", telegram: "Telegram", youtube: "YouTube", instagram: "Instagram", tiktok: "TikTok", web: "the open web" };

/* ============================================================
   COMMUNITIES — the specific, vulnerable audiences PLAYED
   Guardians is built to reach. Each is real and documented;
   generic "global youth" is exactly what does not win.
   ============================================================ */
window.COMMUNITIES = [
  {
    ico: window.UI_ICON("users"), name: "Families & elders online",
    who: "Parents and grandparents newly on Facebook, WhatsApp and IMO — the fastest-growing users, and the least prepared.",
    threat: "Health cures, kidnapper rumours, communal panic — spread in closed family groups where no fact-checker can reach.",
    reach: "Youth trained as the guardian of their own family group. The Group Chat chapter rehearses exactly this."
  },
  {
    ico: window.UI_ICON("shirt"), name: "Garment (RMG) workers",
    who: "≈4 million workers, mostly young women — one of the world's largest concentrations of first-generation smartphone users.",
    threat: "Fake overtime/wage notices, loan and mobile-money (bKash/Nagad) scams, and health misinformation on the factory floor.",
    reach: "20-minute sessions run through factory welfare committees and worker federations."
  },
  {
    ico: window.UI_ICON("ballot"), name: "First-time & rural voters",
    who: "Young and rural citizens voting for the first time, in a region where AI now enters elections.",
    threat: "Documented 2024 deepfakes of candidates — audio, video, and fabricated 'leaked' clips timed to spread before polls.",
    reach: "Peer-led sessions in colleges, youth clubs and union libraries."
  },
  {
    ico: window.UI_ICON("shield-heart"), name: "Women & girls targeted by rumour",
    who: "Young women whose reputations — and sometimes lives — are attacked online, often around marriage and dowry disputes.",
    threat: "Fabricated ‘leaked’ and morphed/AI photos plus character-rumours, spread in community and family groups to shame, blackmail and coerce — a documented driver of harassment and suicide.",
    reach: "Bystander training: every player learns to recognise a fake image, refuse to spread it, defend the target, and report — the Group Chat's fourth scenario rehearses exactly this."
  },
  {
    ico: window.UI_ICON("plane"), name: "Migrant workers & their families",
    who: "Millions working abroad and the families at home who receive their remittances.",
    threat: "'$500/day' recruitment scams, remittance phishing, and deepfaked-celebrity investment schemes that target both ends.",
    reach: "Sessions via diaspora networks and hometown family workshops — the two audiences the scam links together."
  },
  {
    ico: window.UI_ICON("book"), name: "Madrasa & rural college students",
    who: "Students in institutions that are almost always left out of media-literacy curricula entirely.",
    threat: "Communal rumours and 'religious authority' framing that public MIL campaigns rarely reach or address respectfully.",
    reach: "Bangla-first, offline-first sessions co-designed with the institutions themselves — the population others skip."
  },
  {
    ico: window.UI_ICON("access"), name: "Low-bandwidth & low-vision users",
    who: "Anyone on an old phone, a slow connection, or a screen reader — the youth the internet quietly forgets.",
    threat: "Locked out of most modern MIL tools by download size, data cost, or inaccessible design.",
    reach: "One offline folder, keyboard-playable, screen-reader labelled, with a text-only mode on the roadmap."
  },
];

/* ============================================================
   PREBUNK_CARDS — printable, shareable "before you forward"
   cards, in Bangla + English, using the truth-sandwich format.
   Designed to be dropped straight into a family group chat.
   ============================================================ */
window.PREBUNK_CARDS = [
  {
    ico: window.UI_ICON("bridge"), tag: "Kidnapping / construction rumour",
    rumor_bn: "“পদ্মা সেতুর জন্য মানুষের মাথা লাগবে — ছেলেধরা ঘুরছে!”",
    rumor_en: "“The bridge needs human heads — kidnappers are about!”",
    fact: "Bridges are built by engineers and machines — the Padma Bridge employed ~30,000 workers and zero rituals.",
    trick: "Fear + conspiracy framing. This exact rumour got innocent people lynched in 2019.",
    source: "Bangladesh Police; Rumor Scanner"
  },
  {
    ico: window.UI_ICON("leaf"), tag: "Miracle health cure",
    rumor_bn: "“খালি পেটে এটা খেলে ক্যান্সার সারে — ডাক্তাররা চায় না তুমি জানো।”",
    rumor_en: "“Eat this on an empty stomach and cancer is cured — doctors don't want you to know.”",
    fact: "No food or herb cures cancer. Delaying real treatment for a 'natural cure' measurably lowers survival.",
    trick: "False authority ('doctors hide it') + urgency. See the thankuni-leaf COVID rumour of 2020.",
    source: "Cancer Research UK; BOOM Bangladesh"
  },
  {
    ico: window.UI_ICON("video"), tag: "Political deepfake",
    rumor_bn: "“ভিডিওতে উনি নিজেই স্বীকার করছেন! ছড়িয়ে দাও!”",
    rumor_en: "“In this video the candidate admits it himself! Share it!”",
    fact: "AI voice and video clones cost a few dollars. Check a fact-check outlet before forwarding any 'leaked' clip.",
    trick: "Synthetic 'proof' + urgency, often timed just before an election. Documented in Bangladesh, 2023–24.",
    source: "Dismislab; AFP Fact Check"
  },
  {
    ico: window.UI_ICON("banknote"), tag: "Job / earning scam",
    rumor_bn: "“ঘরে বসে ভিডিও লাইক দিয়ে দিনে ৫০০ টাকা! আগে জমা দাও, পরে আয়।”",
    rumor_en: "“Earn ৳500/day liking videos from home! Deposit first, earn later.”",
    fact: "If you must pay to start earning, it's a scam. Real jobs never ask for a deposit to 'unlock' your wages.",
    trick: "The task scam — small early payouts build trust, then your deposit vanishes.",
    source: "US FTC; CID Bangladesh advisories"
  },
  {
    ico: window.UI_ICON("waves"), tag: "Recycled disaster photo",
    rumor_bn: "“বন্যায় হাইওয়েতে হাঙর! খবরে দেখাবে না!”",
    rumor_en: "“A shark on the flooded highway! The news won't show you!”",
    fact: "Do a reverse image search. The famous 'flood shark' is one 2011 photo, recycled after nearly every flood since.",
    trick: "Old photo, new caption. A 'breaking' image with a long history is a red flag.",
    source: "Snopes; AP Fact Check"
  },
  {
    ico: window.UI_ICON("shield-heart"), tag: "‘Leaked photo’ of a woman",
    rumor_bn: "“অমুকের ‘আসল চেহারা’ — ছবি সহ! সবাইকে জানাও।”",
    rumor_en: "“So-and-so's ‘real character’ — with photo! Let everyone know.”",
    fact: "Assume a ‘leaked’ photo of a woman is fake or morphed — it usually is. Don't share it, defend her, and report it. Spreading such an image is a crime, not gossip.",
    trick: "Image-based abuse: a fabricated/AI photo used to shame or blackmail a woman, often around marriage or dowry. It has driven real harassment and suicides.",
    source: "Bangladesh Police Cyber unit; UN Women"
  },
  {
    ico: window.UI_ICON("message-heart"), tag: "How to correct kindly",
    rumor_bn: "কীভাবে বড়দের সংশোধন করবেন — মুখ রক্ষা করে।",
    rumor_en: "How to correct an elder — without making them lose face.",
    fact: "Lead with the fact, thank them for caring, name the trick gently (not the person), add a trusted source, close with the fact.",
    trick: "Shaming an elder in public makes them defend the lie. Respect changes minds; ridicule hardens them.",
    source: "The 'truth sandwich' — Prof. George Lakoff"
  },
];

/* condensed clue lines for Training Mode (generated from src + truth) */
window.CASE_TYPES = {
  health: { label: "Health", ico: window.UI_ICON("flask") },
  climate: { label: "Climate & disaster", ico: window.UI_ICON("storm") },
  ai: { label: "AI & deepfakes", ico: window.UI_ICON("bot") },
  scam: { label: "Scams", ico: window.UI_ICON("banknote") },
  election: { label: "Elections", ico: window.UI_ICON("ballot") },
  conflict: { label: "Conflict & society", ico: window.UI_ICON("alert") },
  conspiracy: { label: "Conspiracies", ico: window.UI_ICON("eye-off") },
  true: { label: "Actually true!", ico: window.UI_ICON("check-circle") },
};
