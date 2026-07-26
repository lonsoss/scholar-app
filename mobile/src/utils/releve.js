import { coefficient } from '../api/subjects';

/* ------------------------------------------------------------------------
 * CALCUL DU RELEVE DE NOTES
 * ------------------------------------------------------------------------
 * Deux particularites du backend imposent la logique ci-dessous :
 *
 * 1. Il n'y a pas de champ "coefficient" : on utilise `credits` (voir
 *    api/subjects.js). La moyenne generale est donc PONDEREE.
 *
 * 2. Un etudiant peut avoir PLUSIEURS notes dans la meme matiere (le champ
 *    `examType` vaut MIDTERM, FINAL...). On calcule donc d'abord la moyenne
 *    simple des examens de chaque matiere, PUIS on pondere ces moyennes par
 *    les coefficients :
 *
 *        moyenne generale = Somme(moyenne_matiere x coef) / Somme(coef)
 *
 * Les notes du backend sont sur 100 (ex. 85.5, 92.0), pas sur 20 : les seuils
 * de mention ci-dessous sont donc exprimes sur 100.
 * ---------------------------------------------------------------------- */

export const NOTE_MAX = 100;

/**
 * Construit le relevé d'un etudiant.
 *
 * @param {Array} subjects toutes les matieres existantes (GET /subjects)
 * @param {Array} scores   les notes de l'etudiant (GET /scores/student/{id})
 * @returns {{lignes: Array, matieresManquantes: Array, complet: boolean, moyenneGenerale: number|null}}
 */
export function construireReleve(subjects, scores) {
  const listeMatieres = subjects || [];
  const listeNotes = scores || [];

  // Une ligne de relevé par matiere existante, meme si l'etudiant n'y a
  // aucune note : c'est ce qui permet de lui dire ce qui lui manque.
  const lignes = listeMatieres.map((subject) => {
    const notesMatiere = listeNotes.filter(
      (n) => Number(n.subjectId) === Number(subject.id)
    );

    // Moyenne des differents examens de cette matiere (null si aucune note)
    let moyenneMatiere = null;
    if (notesMatiere.length > 0) {
      const total = notesMatiere.reduce((somme, n) => somme + Number(n.score), 0);
      moyenneMatiere = total / notesMatiere.length;
    }

    return {
      subject,
      coef: coefficient(subject),
      notes: notesMatiere,
      moyenneMatiere,
    };
  });

  const matieresManquantes = lignes
    .filter((ligne) => ligne.moyenneMatiere === null)
    .map((ligne) => ligne.subject.name);

  // Le relevé n'est "complet" que s'il existe au moins une matiere et que
  // l'etudiant a une note dans chacune d'elles. C'est cette valeur qui pilote
  // l'activation du bouton "Telecharger le relevé".
  const complet = lignes.length > 0 && matieresManquantes.length === 0;

  let moyenneGenerale = null;
  if (complet) {
    const sommePonderee = lignes.reduce(
      (somme, ligne) => somme + ligne.moyenneMatiere * ligne.coef,
      0
    );
    const sommeCoefs = lignes.reduce((somme, ligne) => somme + ligne.coef, 0);
    moyenneGenerale = sommePonderee / sommeCoefs;
  }

  return { lignes, matieresManquantes, complet, moyenneGenerale };
}

/** Mention correspondant a une moyenne sur 100. */
export function mention(moyenne) {
  if (moyenne === null || moyenne === undefined) return '';
  if (moyenne >= 90) return 'Excellent';
  if (moyenne >= 80) return 'Tres bien';
  if (moyenne >= 70) return 'Bien';
  if (moyenne >= 60) return 'Assez bien';
  if (moyenne >= 50) return 'Passable';
  return 'Insuffisant';
}

/** Affichage d'une note avec 2 decimales, ou "-" si absente. */
export function formaterNote(valeur) {
  if (valeur === null || valeur === undefined || Number.isNaN(Number(valeur))) {
    return '-';
  }
  return Number(valeur).toFixed(2);
}
