import { Dimensions, Platform } from 'react-native';

// Get screen dimensions
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Breakpoints for different device types
export const breakpoints = {
  mobile: 480,
  tablet: 768,
  desktop: 1024,
  largeDesktop: 1440,
  ultraWide: 1920
};

// Device type detection
export const getDeviceType = () => {
  if (Platform.OS === 'web') {
    if (screenWidth < breakpoints.mobile) return 'mobile';
    if (screenWidth < breakpoints.tablet) return 'mobile';
    if (screenWidth < breakpoints.desktop) return 'tablet';
    if (screenWidth < breakpoints.largeDesktop) return 'desktop';
    if (screenWidth < breakpoints.ultraWide) return 'largeDesktop';
    return 'ultraWide';
  }
  
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    if (screenWidth < 600 || screenHeight < 800) return 'mobile';
    return 'tablet';
  }
  
  return 'mobile';
};

// Responsive dimensions
export const wp = (percentage) => {
  return (screenWidth * percentage) / 100;
};

export const hp = (percentage) => {
  return (screenHeight * percentage) / 100;
};

// Responsive font scaling
export const responsiveFont = (size) => {
  const deviceType = getDeviceType();
  const scaleFactor = {
    mobile: 1,
    tablet: 1.2,
    desktop: 1.3,
    largeDesktop: 1.4,
    ultraWide: 1.5
  };
  return size * (scaleFactor[deviceType] || 1);
};

// Grid columns calculation
export const getGridColumns = () => {
  const deviceType = getDeviceType();
  // Optimize columns for different screen sizes
  const columns = {
    mobile: screenWidth < 360 ? 1 : 2, // Single column for very small devices
    tablet: 3,
    desktop: 4,
    largeDesktop: 5,
    ultraWide: 6
  };
  return columns[deviceType] || 2;
};

// Responsive spacing
export const getSpacing = (base = 16) => {
  const deviceType = getDeviceType();
  const multiplier = {
    mobile: 1,
    tablet: 1.2,
    desktop: 1.4,
    largeDesktop: 1.6,
    ultraWide: 1.8
  };
  return base * (multiplier[deviceType] || 1);
};

// Container max width for web
export const getMaxContainerWidth = () => {
  const deviceType = getDeviceType();
  const maxWidths = {
    mobile: screenWidth,
    tablet: 800,
    desktop: 1200,
    largeDesktop: 1400,
    ultraWide: 1600
  };
  return maxWidths[deviceType] || screenWidth;
};

// Responsive padding
export const getContainerPadding = () => {
  const deviceType = getDeviceType();
  const padding = {
    mobile: 16,
    tablet: 24,
    desktop: 32,
    largeDesktop: 40,
    ultraWide: 48
  };
  return padding[deviceType] || 16;
};

// Check if device is web
export const isWeb = Platform.OS === 'web';

// Check if device supports hover
export const supportsHover = isWeb;

// Export screen dimensions
export { screenWidth, screenHeight };

// Responsive image dimensions
export const getImageDimensions = () => {
  const columns = getGridColumns();
  const padding = getContainerPadding();
  const spacing = 8;
  
  // Calculate available width accounting for container padding and spacing between items
  const availableWidth = Math.min(screenWidth, getMaxContainerWidth()) - (padding * 2);
  const imageWidth = (availableWidth - (spacing * (columns - 1))) / columns;
  
  // Adjust aspect ratio based on device type for better visual balance
  const deviceType = getDeviceType();
  const aspectRatio = deviceType === 'mobile' ? 1.3 : 1.5; // Slightly shorter on mobile
  const imageHeight = imageWidth * aspectRatio;
  
  return { width: imageWidth, height: imageHeight };
};

// Responsive modal dimensions
export const getModalDimensions = () => {
  const deviceType = getDeviceType();
  
  if (deviceType === 'mobile') {
    return {
      width: screenWidth * 0.9,
      maxWidth: screenWidth * 0.95,
      height: screenHeight * 0.8
    };
  }
  
  return {
    width: Math.min(600, screenWidth * 0.8),
    maxWidth: 800,
    height: Math.min(700, screenHeight * 0.9)
  };
};
