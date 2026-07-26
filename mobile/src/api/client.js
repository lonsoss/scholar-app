import axios from 'axios';

/* ------------------------------------------------------------------------
 * ADRESSE DU BACKEND
 * ------------------------------------------------------------------------
 * ATTENTION : sur un telephone ou un emulateur, "localhost" designe
 * l'appareil lui-meme, PAS la machine de developpement. Mettre
 * http://localhost:8080 ici donnerait donc une erreur reseau sur mobile.
 * Il faut utiliser l'IP LAN de la machine qui fait tourner WildFly.
 *
 * Comment trouver cette IP ?
 *   - Windows : ouvrir un terminal, taper `ipconfig` et relever la ligne
 *     "Adresse IPv4" de la carte Wi-Fi (ex. 192.168.100.2).
 *   - C'est aussi l'IP affichee par Metro au demarrage, dans l'URL du type
 *     exp://192.168.x.x:8081.
 *
 * Cote serveur : WildFly n'ecoute par defaut que sur 127.0.0.1, il est donc
 * injoignable depuis le reseau. Le demarrer avec :
 *     standalone.bat -b 0.0.0.0
 * ---------------------------------------------------------------------- */
const HOST = '192.168.100.2'; // <-- a remplacer si l'IP de la machine change
const PORT = 8080;
const CONTEXTE = 'school-rest-jax-rs';

export const BASE_URL = `http://${HOST}:${PORT}/${CONTEXTE}/api`;

/* ------------------------------------------------------------------------
 * INSTANCE AXIOS UNIQUE
 * ------------------------------------------------------------------------
 * Tous les services (students.js, subjects.js, scores.js) importent CETTE
 * instance : l'adresse du serveur n'est donc ecrite qu'a un seul endroit.
 *
 * Pourquoi axios plutot que fetch ?
 *   1. axios parse le JSON automatiquement (pas besoin de `await res.json()`)
 *   2. axios leve une erreur sur les statuts non-2xx (404, 500...), alors que
 *      fetch considere une reponse 404 comme un succes. La gestion d'erreurs
 *      via try/catch est donc beaucoup plus simple et fiable.
 * ---------------------------------------------------------------------- */
const client = axios.create({
  baseURL: BASE_URL,
  timeout: 10000, // 10 s : au-dela, on considere le serveur injoignable
  headers: { 'Content-Type': 'application/json' },
});

/**
 * Transforme une erreur axios en message lisible pour l'utilisateur.
 * Trois cas distincts, qui n'ont pas la meme cause ni la meme solution.
 */
export function messageErreur(error) {
  // 1. Le serveur a repondu, mais avec un statut d'erreur (404, 400, 500...)
  if (error.response) {
    const { status, data } = error.response;
    const detail = data && data.message ? data.message : '';
    if (status === 404) return detail || 'Element introuvable.';
    if (status === 400) return detail || 'Donnees invalides.';
    return `Erreur serveur (${status}). ${detail}`.trim();
  }
  // 2. La requete est partie mais aucune reponse : serveur eteint, mauvaise
  //    IP, ou WildFly demarre sans -b 0.0.0.0
  if (error.request) {
    return `Serveur injoignable a l'adresse ${BASE_URL}.\n\nVerifier que WildFly tourne et qu'il est demarre avec -b 0.0.0.0, et que l'IP dans src/api/client.js est correcte.`;
  }
  // 3. Erreur de configuration cote application
  return error.message || 'Une erreur inattendue est survenue.';
}

export default client;
