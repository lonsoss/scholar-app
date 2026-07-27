import { formaterNote, mention, NOTE_MAX } from './releve';
import { LOGO_ISGA } from './logoIsga';

/* ------------------------------------------------------------------------
 * GENERATION DU HTML DU RELEVE
 * ------------------------------------------------------------------------
 * expo-print transforme une chaine HTML en PDF. On construit donc ici le
 * document, avec un vrai tableau matiere / coef / note, la moyenne generale et
 * la mention.
 *
 * Le style est en CSS classique (et non en StyleSheet React Native) : ce HTML
 * n'est pas rendu par React Native mais par le moteur d'impression du systeme.
 * ---------------------------------------------------------------------- */

/**
 * Echappe les caracteres speciaux HTML.
 * Indispensable : un nom contenant & ou < casserait le document, et on ne veut
 * pas qu'une donnee saisie par l'utilisateur puisse injecter du balisage.
 */
function echapper(texte) {
  return String(texte === null || texte === undefined ? '' : texte)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Construit le HTML du relevé.
 *
 * @param {object} params
 * @param {object} params.etudiant  l'etudiant concerne
 * @param {Array}  params.lignes    les lignes produites par construireReleve()
 * @param {number} params.moyenneGenerale
 * @param {string} params.dateEdition date d'edition, au format lisible
 */
export function construireHtmlReleve({ etudiant, lignes, moyenneGenerale, dateEdition }) {
  const nom = echapper(`${etudiant.firstName} ${etudiant.lastName}`);
  const laMention = mention(moyenneGenerale);

  // Une ligne de tableau par matiere. On indique aussi le detail des examens
  // quand la matiere en compte plusieurs, pour que le relevé soit verifiable.
  const lignesHtml = lignes
    .map((ligne) => {
      const detailExamens =
        ligne.notes.length > 1
          ? `<div class="detail">${ligne.notes
              .map(
                (n) =>
                  `${echapper(n.examType || 'Examen')} : ${formaterNote(n.score)}`
              )
              .join(' &middot; ')}</div>`
          : '';

      return `
        <tr>
          <td>
            <strong>${echapper(ligne.subject.name)}</strong>
            <div class="code">${echapper(ligne.subject.code)}</div>
            ${detailExamens}
          </td>
          <td class="centre">${ligne.coef}</td>
          <td class="centre note">${formaterNote(ligne.moyenneMatiere)} / ${NOTE_MAX}</td>
        </tr>`;
    })
    .join('');

  const sommeCoefs = lignes.reduce((total, ligne) => total + ligne.coef, 0);

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <title>Releve de notes - ${nom}</title>
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, "Helvetica Neue", Helvetica, Arial, sans-serif;
      color: #0f172a;
      padding: 40px;
      margin: 0;
    }
    /* En-tete en deux colonnes : titre a gauche, logo a droite.
       align-items: flex-start aligne le haut du logo sur le haut du titre. */
    .entete {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 3px solid #2563eb;
      padding-bottom: 16px;
      margin-bottom: 28px;
    }
    .entete h1 { font-size: 24px; margin: 0 0 6px; }
    .entete .date { color: #64748b; font-size: 12px; }
    .entete .logo { height: 54px; width: auto; margin-left: 24px; }
    .identite {
      background: #f1f5f9;
      border-radius: 8px;
      padding: 16px 20px;
      margin-bottom: 28px;
    }
    .identite .nom { font-size: 18px; font-weight: 700; }
    .identite .champ { color: #64748b; font-size: 13px; margin-top: 4px; }
    table { width: 100%; border-collapse: collapse; }
    th {
      background: #2563eb;
      color: #fff;
      text-align: left;
      padding: 10px 12px;
      font-size: 13px;
    }
    th.centre, td.centre { text-align: center; }
    td {
      padding: 12px;
      border-bottom: 1px solid #e2e8f0;
      font-size: 14px;
      vertical-align: top;
    }
    td .code { color: #64748b; font-size: 11px; margin-top: 2px; }
    td .detail { color: #64748b; font-size: 11px; margin-top: 6px; font-style: italic; }
    td.note { font-weight: 700; }
    .bilan {
      margin-top: 28px;
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      border-radius: 8px;
      padding: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .bilan .libelle { font-size: 14px; color: #1e40af; font-weight: 600; }
    .bilan .valeur { font-size: 28px; font-weight: 800; color: #1e40af; }
    .bilan .mention { font-size: 13px; color: #1e40af; margin-top: 4px; }
    .methode {
      margin-top: 20px;
      font-size: 11px;
      color: #64748b;
      line-height: 1.6;
    }
  </style>
</head>
<body>
  <div class="entete">
    <div>
      <h1>Releve de notes</h1>
      <div class="date">Edite le ${echapper(dateEdition)}</div>
    </div>
    <img class="logo" src="${LOGO_ISGA}" alt="ISGA" />
  </div>

  <div class="identite">
    <div class="nom">${nom}</div>
    ${etudiant.email ? `<div class="champ">${echapper(etudiant.email)}</div>` : ''}
    ${
      etudiant.dateOfBirth
        ? `<div class="champ">Ne(e) le ${echapper(etudiant.dateOfBirth)}</div>`
        : ''
    }
  </div>

  <table>
    <thead>
      <tr>
        <th>Matiere</th>
        <th class="centre">Coef.</th>
        <th class="centre">Note</th>
      </tr>
    </thead>
    <tbody>${lignesHtml}</tbody>
  </table>

  <div class="bilan">
    <div>
      <div class="libelle">Moyenne generale ponderee</div>
      ${laMention ? `<div class="mention">Mention : ${echapper(laMention)}</div>` : ''}
    </div>
    <div class="valeur">${formaterNote(moyenneGenerale)} / ${NOTE_MAX}</div>
  </div>

  <div class="methode">
    Methode de calcul : la moyenne de chaque matiere est la moyenne de ses
    examens ; la moyenne generale est la somme des moyennes ponderees par les
    coefficients, divisee par la somme des coefficients (${sommeCoefs}).
  </div>
</body>
</html>`;
}
