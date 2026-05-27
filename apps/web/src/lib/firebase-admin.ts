import "server-only";

import {
  initializeApp,
  getApps,
  cert,
  type AppOptions,
} from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

let adminApp: ReturnType<typeof initializeApp> | undefined;
let adminAuth: Auth | undefined;
let adminDb: Firestore | undefined;

if (serviceAccount && !getApps().length) {
  try {
    const credentials = JSON.parse(serviceAccount);
    adminApp = initializeApp({ credential: cert(credentials) });
    adminAuth = getAuth(adminApp);
    adminDb = getFirestore(adminApp);
  } catch (e) {
    console.error("Firebase Admin init error:", e);
  }
}

export { adminApp, adminAuth, adminDb };
