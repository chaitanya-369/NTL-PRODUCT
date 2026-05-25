const admin = require("firebase-admin");

// To run this script: 
// 1. Export GOOGLE_APPLICATION_CREDENTIALS pointing to service account key
// 2. Run: node seed_config.js

admin.initializeApp();
const db = admin.firestore();

async function seedSystemConfig() {
  console.log("Seeding system_config/global...");
  
  const configRef = db.collection("system_config").doc("global");
  
  const configData = {
    agent_settings: {
      enable_autonomous_matching: true,
      scoutCronInterval: 6, // Runs every 6 hours
      activeScoutSources: ['mlh', 'devpost', 'unstop', 'hackerearth'],
      valueScoreThreshold: {
        instant: 80,
        batched: 50
      },
      github_sync_frequency_hours: 12,
      max_active_squads: 10
    },
    lab_definitions: [
      { id: "mccarthy", name: "McCarthy Lab (AI)", lead_id: "" },
      { id: "norman", name: "Norman Lab (Design)", lead_id: "" },
      { id: "tesla", name: "Tesla Lab (Hardware/IoT)", lead_id: "" },
      { id: "satoshi", name: "Satoshi Lab (Web3/Crypto)", lead_id: "" }
    ],
    updatedAt: admin.firestore.Timestamp.now()
  };

  await configRef.set(configData, { merge: true });
  console.log("Successfully seeded system_config/global with exact NTL architecture specs");
}

seedSystemConfig().catch(console.error);
