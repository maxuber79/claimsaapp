/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {setGlobalOptions} from "firebase-functions";
//import {onRequest} from "firebase-functions/https";
//import * as logger from "firebase-functions/logger";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({ maxInstances: 10 });
import { onCall } from "firebase-functions/v1/https";
import * as admin from "firebase-admin";

admin.initializeApp();

/**
 * 🔥 deleteUser
 * Elimina un usuario de Firebase Auth y su perfil en Firestore
 * Solo puede ser ejecutada por un usuario con rol "Administrador"
 */
export const deleteUser = onCall(async (data, context) => {
  const uidToDelete = data.uid;

  // Validación: ¿Estás logueado?
  if (!context.auth) {
    throw new Error("No estás autenticado.");
  }

  const adminUid = context.auth.uid;

  // Obtenemos los datos del usuario que llama (admin)
  const adminDoc = await admin.firestore().collection("users").doc(adminUid).get();

  if (!adminDoc.exists || adminDoc.data()?.rol !== "Administrador") {
    throw new Error("No tienes permisos para eliminar usuarios.");
  }

  try {
    // 1️⃣ Eliminar de Firebase Auth
    await admin.auth().deleteUser(uidToDelete);

    // 2️⃣ Eliminar de Firestore
    await admin.firestore().collection("users").doc(uidToDelete).delete();

    return { success: true, message: `Usuario ${uidToDelete} eliminado correctamente.` };
  } catch (error) {
    console.error("❌ Error al eliminar usuario:", error);
    throw new Error("Ocurrió un error al eliminar el usuario.");
  }
});

// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
