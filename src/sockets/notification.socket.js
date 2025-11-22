import jwt from "jsonwebtoken";

export function registerNotificationSocket(io) {
  io.on("connection", (socket) => {

    // 1. Récupérer le token envoyé par le frontend
    const token = socket.handshake.auth?.token;

    if (!token) {
      socket.emit("error", { message: "Token manquant" });
      socket.disconnect();
      return;
    }

    // 2. Vérifier le JWT
    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      console.error("Erreur de vérification du token JWT :", err);
      socket.emit("error", { message: "Token invalide" });
      socket.disconnect();
      return;
    }

    const userId = payload.sub;

    // 3. Join room sécurisée : un utilisateur = une room
    socket.join(userId);

    console.log(`🔔 User ${userId} connecté aux notifications`);

    // 4. Confirmer la connexion
    socket.emit("notification:connected", {
      message: "Connecté au service de notifications",
      userId
    });

    // 5. Gestion propre de la déconnexion
    socket.on("disconnect", () => {
      console.log(`🔌 User ${userId} déconnecté du système de notifications`);
    });
  });
}
