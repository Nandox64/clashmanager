import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { getUserUid } from "@/lib/api-utils";
import { getProfile, getMemberByUid } from "@/lib/firestore-service";

function getClanDocRef(clanTag: string) {
  return adminDb!.collection("clans").doc(clanTag.replace("#", ""));
}

export async function POST(request: Request) {
  const clanTag = process.env.CLAN_TAG;
  if (!clanTag) {
    return NextResponse.json({ error: "CLAN_TAG no configurado" }, { status: 400 });
  }

  if (!adminDb) {
    return NextResponse.json({ error: "Firebase no disponible" }, { status: 503 });
  }

  const uid = await getUserUid(request);
  if (!uid) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  try {
    // Verificar que quien llama es leader
    const callerProfile = await getProfile(clanTag, uid);
    let callerMemberUid = callerProfile?.linkedMemberId ?? null;
    if (!callerMemberUid) {
      const linksSnap = await getClanDocRef(clanTag)
        .collection("memberLinks")
        .where("firebaseUid", "==", uid)
        .get();
      if (!linksSnap.empty) {
        callerMemberUid = linksSnap.docs[0].id;
      }
    }
    if (!callerMemberUid) {
      return NextResponse.json({ error: "No vinculado" }, { status: 403 });
    }
    const callerMember = await getMemberByUid(clanTag, callerMemberUid);
    if (callerMember?.role !== "leader") {
      return NextResponse.json({ error: "Solo el líder puede ejecutar esta operación" }, { status: 403 });
    }

    // Escanear todos los perfiles
    const profilesSnap = await getClanDocRef(clanTag).collection("profiles").get();
    const memberLinksSnap = await getClanDocRef(clanTag).collection("memberLinks").get();

    // Indexar memberLinks: firebaseUid -> memberUid
    const memberLinksByFirebase = new Map<string, string>();
    memberLinksSnap.docs.forEach((doc) => {
      const data = doc.data();
      if (data.firebaseUid) {
        memberLinksByFirebase.set(data.firebaseUid, doc.id);
      }
    });

    const batch = adminDb.batch();
    let repairedCount = 0;
    const now = Date.now();

    profilesSnap.docs.forEach((doc) => {
      const profile = doc.data();
      if (!profile.linkedMemberId) {
        const memberUid = memberLinksByFirebase.get(doc.id);
        if (memberUid) {
          batch.update(doc.ref, { linkedMemberId: memberUid, linkedAt: now, updatedAt: now });
          repairedCount++;
        }
      }
    });

    if (repairedCount > 0) {
      await batch.commit();
    }

    return NextResponse.json({ repaired: repairedCount, total: profilesSnap.docs.length });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error interno";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
