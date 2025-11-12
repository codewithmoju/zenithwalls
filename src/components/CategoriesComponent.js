import { StyleSheet, Text, View, FlatList, Pressable } from 'react-native'
import React from 'react'
import { Data } from '../constants/Data'
import { hp, wp } from '../helpers/common'
import { theme } from '../constants/themes'
import Animated, { FadeInRight } from 'react-native-reanimated'
import { LinearGradient } from 'expo-linear-gradient'

const CategoriesComponent = ({activeCategory, handleActiveCategory}) => {
    return (
        <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.FlatListContainer}
            data={Data.Categories}
            keyExtractor={item => item}
            renderItem={({ item, index }) => (
                <CategoriesItems
                    isActive={activeCategory==item}
                    handleActiveCategory={handleActiveCategory}
                    title={item}
                    index={index}
                />
            )}
        />
    )
}

export default CategoriesComponent

const CategoriesItems = ({ title, index, isActive, handleActiveCategory }) => {
    return (
        <Animated.View 
            entering={FadeInRight.delay(index*200).duration(1000).springify().damping(14)}
            style={styles.itemContainer}
        >
            <Pressable
                onPress={() => handleActiveCategory(isActive ? null : title)}
                style={styles.buttonContainer}
            >
                {isActive ? (
                    <LinearGradient
                        colors={theme.colors.gradientRoyal}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={[styles.Categories, styles.activeCategory]}
                    >
                        <Text style={[styles.title, { color: theme.colors.white }]}>
                            {title}
                        </Text>
                    </LinearGradient>
                ) : (
                    <View style={[styles.Categories, styles.inactiveCategory]}>
                        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
                            {title}
                        </Text>
                    </View>
                )}
            </Pressable>
        </Animated.View>
    )
}

const styles = StyleSheet.create({
    FlatListContainer: {
        paddingHorizontal: wp(4),
        gap: 8,
        paddingVertical: 8,
        width: '100%'
    },
    itemContainer: {
        marginRight: 8,
        marginBottom: 4
    },
    buttonContainer: {
        overflow: 'hidden',
        borderRadius: theme.radius.lg,
    },
    Categories: {
        padding: 10,
        paddingHorizontal: 15,
        borderRadius: theme.radius.lg,
        borderCurve: 'continuous',
        borderWidth: 1,
        borderColor: 'transparent',
        backgroundColor: theme.colors.white,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        minWidth: wp(20),
        alignItems: 'center',
    },
    title: {
        fontSize: hp(1.9),
        fontWeight: theme.fontWeights.semibold,
        letterSpacing: 0.5
    },
    inactiveCategory: {
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.border,
        ...theme.shadows.sm,
    },
    activeCategory: {
        ...theme.shadows.primaryShadow,
        borderWidth: 0,
        transform: [{ scale: 1.05 }],
    }
})
