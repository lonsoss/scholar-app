import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { couleurs, espacements, rayon } from '../theme';

/* Menu d'accueil : point d'entree vers les trois entites et vers les relevés.
 *
 * `navigation` est une prop injectee automatiquement par react-navigation dans
 * tout ecran declare dans le Stack. `navigation.navigate('NomEcran')` empile
 * l'ecran demande, et la fleche de retour de l'en-tete depile.
 */

const ENTREES = [
  {
    ecran: 'EtudiantsListe',
    titre: 'Etudiants',
    description: 'Ajouter, modifier et supprimer des etudiants',
    icone: '👨‍🎓',
  },
  {
    ecran: 'MatieresListe',
    titre: 'Matieres',
    description: 'Gerer les matieres et leurs coefficients',
    icone: '📚',
  },
  {
    ecran: 'NotesListe',
    titre: 'Notes',
    description: 'Saisir les notes par etudiant et par matiere',
    icone: '📝',
  },
  {
    ecran: 'RelevesListe',
    titre: 'Relevés de notes',
    description: 'Consulter la moyenne et telecharger le relevé en PDF',
    icone: '📄',
  },
];

export default function HomeScreen({ navigation }) {
  return (
    <ScrollView style={styles.ecran} contentContainerStyle={styles.contenu}>
      <Text style={styles.titre}>Gestion scolaire</Text>
      <Text style={styles.sousTitre}>
        Etudiants, matieres et notes — connecte a l'API REST
      </Text>

      {ENTREES.map((entree) => (
        <TouchableOpacity
          key={entree.ecran}
          style={styles.carte}
          activeOpacity={0.8}
          onPress={() => navigation.navigate(entree.ecran)}
        >
          <Text style={styles.icone}>{entree.icone}</Text>
          <View style={styles.zoneTexte}>
            <Text style={styles.carteTitre}>{entree.titre}</Text>
            <Text style={styles.carteDescription}>{entree.description}</Text>
          </View>
          <Text style={styles.fleche}>›</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  ecran: { flex: 1, backgroundColor: couleurs.fond },
  contenu: { padding: espacements.lg },
  titre: {
    fontSize: 26,
    fontWeight: '800',
    color: couleurs.texte,
    marginBottom: espacements.xs,
  },
  sousTitre: {
    fontSize: 15,
    color: couleurs.texteSecondaire,
    marginBottom: espacements.xl,
  },
  carte: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: couleurs.carte,
    borderRadius: rayon,
    padding: espacements.lg,
    marginBottom: espacements.md,
    borderWidth: 1,
    borderColor: couleurs.bordure,
  },
  icone: { fontSize: 28, marginRight: espacements.lg },
  zoneTexte: { flex: 1 },
  carteTitre: { fontSize: 17, fontWeight: '700', color: couleurs.texte },
  carteDescription: {
    fontSize: 13,
    color: couleurs.texteSecondaire,
    marginTop: 2,
  },
  fleche: { fontSize: 26, color: couleurs.texteSecondaire },
});
