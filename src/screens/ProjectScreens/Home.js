// Import necessary components and libraries from React Native and other dependencies
import { StyleSheet, Text, View, Pressable, Image, TextInput, ScrollView, StatusBar, ActivityIndicator, RefreshControl, Platform } from 'react-native'
import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react'
import { SafeAreaInsetsContext } from 'react-native-safe-area-context'
import { theme } from '../../constants/themes'
import { hp, wp } from '../../helpers/common'
import CategoriesComponent from '../../components/CategoriesComponent'
import { apiCall } from '../../API'
import ImageGrid from '../../components/ImageGrid'
import { debounce } from 'lodash'
import FiltersComponent from '../../components/FiltersComponent'
import { MaterialIcons } from '@expo/vector-icons'
import Animated, { 
  FadeInRight, 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring 
} from 'react-native-reanimated'
import { BlurView } from 'expo-blur'
import {
  getMaxContainerWidth,
  getContainerPadding,
  responsiveFont,
  getSpacing,
  supportsHover,
  isWeb,
  getDeviceType
} from '../../utils/responsive'

// Define the Home functional component
const Home = ({ onScroll }) => {
  const [page, setPage] = useState(1);
  const { Top } = SafeAreaInsetsContext;
  const paddingTop = Top > 0 ? Top + 10 : 30;
  const [search, setSearch] = useState('');
  const [images, setImages] = useState([]);
  const [loadedImageIds, setLoadedImageIds] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeCategory, setActivecategory] = useState(null);
  const [filters, setFilters] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [adCounter, setAdCounter] = useState(0);

  const SearchInputRef = useRef(null);
  const Modalref = useRef(null);
  const scrollViewRef = useRef(null);
  const showScrollToTop = useSharedValue(false);

  // Animated scroll to top button style
  const scrollToTopStyle = useAnimatedStyle(() => {
    return {
      opacity: withSpring(showScrollToTop.value ? 1 : 0),
      transform: [{ scale: withSpring(showScrollToTop.value ? 1 : 0.8) }],
    };
  });

  // Memoized search handler for better performance
  const handleSearch = useCallback((text) => {
    setSearch(text);
    if (text.length > 2) {
      setPage(1);
      setImages([]);
      setLoadedImageIds(new Set());
      setHasMore(true);
      setActivecategory(null);
      fetchImages({ page: 1, q: text, ...filters }, false);
    }
    if (text === "") {
      setPage(1);
      SearchInputRef?.current?.clear();
      setActivecategory(null);
      setImages([]);
      setLoadedImageIds(new Set());
      setHasMore(true);
      fetchImages({ page: 1, ...filters }, false);
    }
  }, [filters]);

  const handleTextDebounce = useMemo(() => 
    debounce(handleSearch, 400), 
    [handleSearch]
  );

  // Pull to refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setPage(1);
    setHasMore(true);
    setLoadedImageIds(new Set());
    await fetchImages({ 
      page: 1, 
      q: search,
      category: activeCategory,
      ...filters 
    }, false);
    setRefreshing(false);
  }, [search, activeCategory, filters]);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async (params = { page: 1 }, append = true) => {
    try {
      if (!hasMore && append) {
        console.log('No more images to load');
        return;
      }
      if (loading) {
        console.log('Already loading images');
        return;
      }
      setLoading(true);
      
      // Add image quality parameters for better performance
      const optimizedParams = {
        ...params,
        per_page: 20,  // Number of images per request
        safesearch: true,  // Safe content only
        min_width: 800,   // Minimum image width
        min_height: 800,  // Minimum image height
      };
      
      let res = await apiCall(optimizedParams);
      if (res.success && res?.data?.hits) {
        // Filter out duplicates
        const newImages = res.data.hits.filter(img => !loadedImageIds.has(img.id));
        
        if (newImages.length === 0) {
          // If all images were duplicates, try loading the next page immediately
          if (append) {
            const nextPage = params.page + 1;
            setPage(nextPage);
            setLoading(false);
            fetchImages({ ...optimizedParams, page: nextPage }, true);
          }
          return;
        }
        
        // Update the set of loaded image IDs
        const newImageIds = new Set(newImages.map(img => img.id));
        setLoadedImageIds(prev => new Set([...prev, ...newImageIds]));

        // Pre-process images to ensure they have all required properties
        const processedImages = newImages.map(img => ({
          ...img,
          webformatURL: img.webformatURL.replace('_640', '_480'), // Request smaller images for better performance
          id: img.id.toString(), // Ensure ID is string
        }));

        if (append) {
          setImages(prev => [...prev, ...processedImages]);
        } else {
          setImages(processedImages);
          setLoadedImageIds(newImageIds);
        }
        // Check if we have more images to load
        setHasMore(newImages.length > 0);
      }
    } catch (error) {
      console.error('Error fetching images:', error);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = useCallback(async () => {
    if (!loading && hasMore && page < 50) {
      const nextPage = page + 1;
      setPage(nextPage);
      
      // Previously used to trigger interstitial ads; retained counter for potential future use
      setAdCounter(prev => prev + 1);

      fetchImages({ 
        page: nextPage, 
        q: search, 
        category: activeCategory,
        ...filters 
      }, true);
    }
  }, [page, loading, hasMore, search, activeCategory, filters]);

  // Function to handle active category change
  const handleActiveCategory = (cat) => {
    setActivecategory(cat);
    clearSearch();
    setImages([]);
    setLoadedImageIds(new Set());
    setPage(1);
    setHasMore(true);
    let params = {
      page: 1,
      ...filters
    };
    if (cat) params.category = cat;
    fetchImages(params, false);
  };

  // Function to clear the search input
  const clearSearch = () => {
    setSearch("");
    SearchInputRef?.current?.clear();
  }

  const OpenfiltersModal = () => {
    Modalref?.current?.present();
  }
  const ClosefiltersModal = () => {
    Modalref?.current?.close();
  }

  const Applyfilter = () => {
    ClosefiltersModal();
    if (filters) {
      setPage(1);
      setImages([]);
      let params = {
        page,
        ...filters
      }
      if (activeCategory) params.category = activeCategory;
      if (search) params.q = search
      fetchImages(params, false)
    }
  }
  const Resetfilter = () => {
    ClosefiltersModal();

    if (filters) {
      setPage(1);
      setFilters(null)
      setImages([]);
      let params = {
        page,
      }
      if (activeCategory) params.category = activeCategory;
      if (search) params.q = search
      fetchImages(params, false)
    }
  }

  const clearThisFilter = (filterName) => {
    let newFilters = { ...filters };
    delete newFilters[filterName];
    setFilters({ ...newFilters });
    setPage(1);
    setImages([]);
    let params = {
      page,
      ...newFilters
    }
    if (activeCategory) params.category = activeCategory;
    if (search) params.q = search;
    fetchImages(params, false)
  }

  const handleScrollToTop = () => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  // Return the JSX layout for the Home screen
  return (
    <View style={[styles.container]}>
      <StatusBar
        barStyle={'light-content'}
        translucent={true}
        backgroundColor={'transparent'}
      />
      
      <ScrollView 
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={(event) => {
          const offsetY = event.nativeEvent.contentOffset.y;
          const contentHeight = event.nativeEvent.contentSize.height;
          const scrollViewHeight = event.nativeEvent.layoutMeasurement.height;
          
          // Show/hide scroll to top button
          showScrollToTop.value = offsetY > 300;
          
          // Check if user has scrolled to the bottom (with a threshold of 50px)
          const isCloseToBottom = contentHeight - scrollViewHeight - offsetY < 50;
          if (isCloseToBottom && !loading && hasMore) {
            handleLoadMore();
          }
          
          if (onScroll) onScroll(event);
        }}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
            // style={{marginTop:20}}
          />
        }
      >
        {/* Header moved inside ScrollView */}
        <View style={styles.headerContainer}>
          <View style={styles.headerBlur}>
          <View style={styles.header}>
            <Pressable>
              <Text style={styles.headertext}>
                Zenith Walls
              </Text>
            </Pressable>
            <Pressable 
              onPress={OpenfiltersModal}
              style={styles.filterButton}
            >
              <MaterialIcons name="tune" size={24} color={theme.colors.text} />
            </Pressable>
          </View>

          {/* Search bar */}
            <View style={styles.SearchBar}>
            <View style={styles.Icon}>
              <MaterialIcons name="search" size={20} color={theme.colors.textSecondary} />
            </View>
            <TextInput
              placeholder='Search wallpapers...'
              placeholderTextColor={theme.colors.textSecondary}
              ref={SearchInputRef}
              onChangeText={handleTextDebounce}
              style={styles.textInput}
            />
            {search && (
              <Pressable 
                onPress={() => { handleSearch("") }}
                style={styles.clearButton}
              >
                <MaterialIcons name="close" size={20} color={theme.colors.textSecondary} />
              </Pressable>
            )}
            </View>
          </View>
        </View>

        <View style={styles.contentContainer}>
          {/* Active Filters */}
          {filters && Object.keys(filters).length > 0 && (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.activeFiltersContainer}
            >
              {Object.entries(filters).map(([key, value], index) => (
                <Animated.View
                  key={key}
                  entering={FadeInRight.delay(index * 100).springify()}
                >
                  <Pressable
                    style={styles.activeFilter}
                    onPress={() => clearThisFilter(key)}
                  >
                    <Text style={styles.activeFilterText}>{value}</Text>
                    <MaterialIcons name="close" size={16} color={theme.colors.text} />
                  </Pressable>
                </Animated.View>
              ))}
            </ScrollView>
          )}

          {/* Categories */}
          <View style={styles.categories}>
            <CategoriesComponent
              activeCategory={activeCategory}
              handleActiveCategory={handleActiveCategory}
            />
          </View>

          {/* Image Grid */}
          <ImageGrid 
            images={images} 
            onLoadMore={handleLoadMore}
            loading={loading}
          />

          {!loading && !hasMore && images.length > 0 && (
            <View style={styles.endMessageContainer}>
              <Text style={styles.endMessage}>No more wallpapers to load</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Scroll to Top Button */}
      <Animated.View style={[styles.scrollToTopButton, scrollToTopStyle]}>
        <Pressable
          onPress={handleScrollToTop}
          style={styles.scrollToTopButtonInner}
        >
          <MaterialIcons name="keyboard-arrow-up" size={28} color={theme.colors.white} />
        </Pressable>
      </Animated.View>

      {/* Filters Modal */}
      <FiltersComponent
        Modalref={Modalref}
        onClose={ClosefiltersModal}
        onApply={Applyfilter}
        onReset={Resetfilter}
        filters={filters}
        setFilters={setFilters}
      />

      {/* Banner placeholder removed since ads are disabled */}
    </View>
  )
}

// Export the Home component as the default export
export default Home

// Define the styles used in the Home component
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    maxWidth: getMaxContainerWidth(),
    alignSelf: 'center',
    width: '100%',
    paddingBottom: Platform.OS === 'ios' ? getSpacing(20) : 0,
  },
  headerContainer: {
    backgroundColor: theme.colors.background,
    paddingTop: Platform.OS === 'ios' ? getSpacing(50) : getSpacing(40),
    width: '100%',
  },
  headerBlur: {
    paddingHorizontal: getContainerPadding(),
    paddingBottom: getSpacing(10),
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: getSpacing(5),
  },
  headertext: {
    fontSize: responsiveFont(24),
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  filterButton: {
    padding: getSpacing(8),
    borderRadius: getSpacing(12),
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.sm,
    ...(supportsHover && {
      cursor: 'pointer',
      transition: 'all 0.2s ease-in-out',
    }),
  },
  SearchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: getSpacing(20),
    marginTop: getSpacing(15),
    marginBottom: getSpacing(5),
    paddingHorizontal: getSpacing(20),
    height: getSpacing(52),
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    ...theme.shadows.luxury,
    width: '100%',
  },
  Icon: {
    marginRight: getSpacing(10),
  },
  textInput: {
    flex: 1,
    color: theme.colors.text,
    fontSize: responsiveFont(16),
    ...(isWeb && {
      outlineStyle: 'none',
    }),
  },
  clearButton: {
    padding: getSpacing(5),
    ...(supportsHover && {
      cursor: 'pointer',
    }),
  },
  scrollContent: {
    paddingTop: 0,
    flexGrow: 1,
  },
  contentContainer: {
    gap: theme.spacing.md,
    flexGrow: 1,
    width: '100%',
  },
  categories: {
    marginTop: 0, // Removed margin
  },
  activeFiltersContainer: {
    paddingHorizontal: wp(4),
    gap: theme.spacing.sm,
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  activeFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.lg,
    gap: theme.spacing.sm,
    ...theme.shadows.sm,
    marginBottom: theme.spacing.sm,
    marginRight: theme.spacing.sm,
  },
  activeFilterText: {
    fontSize: hp(1.8),
    color: theme.colors.text,
    fontWeight: theme.fontWeights.medium,
  },
  endMessageContainer: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  endMessage: {
    color: theme.colors.textSecondary,
    fontSize: hp(1.8),
    fontWeight: theme.fontWeights.medium,
  },
  scrollToTopButton: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 90 : 70, // Position above the tab bar, adjusted for different platforms
    right: getContainerPadding() / 2,
    zIndex: 10,
  },
  scrollToTopButtonInner: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 5,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  bannerContainer: {
    width: '100%',
    height: 50,
    backgroundColor: 'transparent',
    position: 'absolute',
    bottom: 0
  }
});
