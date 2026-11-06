import { Alert, Linking } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

// Prend une photo ou en choisit une dans la galerie (recadrage carré). Renvoie
// l'URI temporaire du sélecteur — à copier ensuite dans le dossier de l'appli
// par storeProfilePhoto — ou null (annulé / refusé).
export async function pickPhoto(source: 'camera' | 'library'): Promise<string | null> {
  const perm =
    source === 'camera'
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (!perm.granted) {
    Alert.alert(
      source === 'camera' ? 'Appareil photo refusé' : 'Galerie refusée',
      'Autorise l’accès dans les réglages du téléphone pour ajouter une photo. Tu peux aussi garder simplement l’initiale.',
      [
        { text: 'Plus tard', style: 'cancel' },
        { text: 'Ouvrir les réglages', onPress: () => Linking.openSettings() },
      ]
    );
    return null;
  }

  const options: ImagePicker.ImagePickerOptions = { allowsEditing: true, aspect: [1, 1], quality: 1 };
  const result =
    source === 'camera' ? await ImagePicker.launchCameraAsync(options) : await ImagePicker.launchImageLibraryAsync({ ...options, mediaTypes: ['images'] });
  if (result.canceled || !result.assets?.[0]?.uri) return null;
  return result.assets[0].uri;
}
