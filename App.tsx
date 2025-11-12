import { StyleSheet, View } from 'react-native'
import React, { useEffect } from 'react'
import { StatusBar } from 'expo-status-bar'
import { theme } from './src/constants/themes'
import Appnavigation from './src/screens/navigator/Appnavigation'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { FavoritesProvider } from './src/constants/FavoritesContext'
import { injectWebStyles } from './src/utils/webStyles'
import * as Updates from 'expo-updates'

const App = () => {
  useEffect(() => {
    // Inject web-specific styles for responsive design
    injectWebStyles();
    
    // Check for updates on app launch
    async function checkForUpdates() {
      try {
        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
          await Updates.fetchUpdateAsync();
          await Updates.reloadAsync();
        }
      } catch (error) {
        console.log('Error checking for updates:', error);
      }
    }
    
    checkForUpdates();
  }, []);

  return (
    <GestureHandlerRootView style={styles.container}>
      <FavoritesProvider>
        <StatusBar style="light" backgroundColor={theme.colors.background} />
        <Appnavigation/>
      </FavoritesProvider>
    </GestureHandlerRootView>
  )
}

export default App

const styles = StyleSheet.create({
  container:{
    flex:1
  }
})