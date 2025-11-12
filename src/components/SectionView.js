import { Pressable, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { captilization, hp, wp } from '../helpers/common'
import { theme } from '../constants/themes'
import { LinearGradient } from 'expo-linear-gradient'
import { MaterialCommunityIcons } from '@expo/vector-icons'

const SectionView = ({ title, content }) => {
    return (
        <View style={styles.SectionContainer}>
            <Text style={styles.SectionTitle}>{title}</Text>
            <View>
                {content}
            </View>
        </View>
    )
}

export default SectionView

export const CommonFilterRow = ({ data, filterName, filters, setFilters }) => {
    const onSelect = (item) => {
        setFilters({ ...filters, [filterName]: item })
    }

    return (
        <View style={styles.flexBoxWrap}>
            {
                data && data.map((item, index) => {
                    let isActive = filters && filters[filterName] == item;
                    return (
                        <Pressable
                            onPress={() => onSelect(item)}
                            key={item}
                            style={styles.buttonContainer}
                        >
                            {isActive ? (
                                <LinearGradient
                                    colors={theme.colors.gradientRoyal}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.ButtonOutLine}
                                >
                                    <Text style={[styles.OutlinedButtonText, { color: theme.colors.white }]}>
                                        {captilization(item)}
                                    </Text>
                                </LinearGradient>
                            ) : (
                                <View style={[styles.ButtonOutLine, { backgroundColor: theme.colors.surface }]}>
                                    <Text style={[styles.OutlinedButtonText, { color: theme.colors.text }]}>
                                        {captilization(item)}
                                    </Text>
                                </View>
                            )}
                        </Pressable>
                    )
                })
            }
        </View>
    )
}

export const ColorFilters = ({ data, filterName, filters, setFilters }) => {
    const onSelect = (item) => {
        setFilters({ ...filters, [filterName]: item })
    }

    return (
        <View style={styles.flexBoxWrap}>
            {
                data && data.map((item, index) => {
                    let isActive = filters && filters[filterName] == item;
                    return (
                        <Pressable
                            onPress={() => onSelect(item)}
                            key={item}
                        >
                            <View style={[styles.colorWrapper, isActive && styles.activeColorWrapper]}>
                                <View style={[styles.color, { backgroundColor: item }]}>
                                    {isActive && (
                                        <MaterialCommunityIcons 
                                            name="check" 
                                            size={20} 
                                            color={item === 'white' ? 'black' : 'white'} 
                                        />
                                    )}
                                </View>
                            </View>
                        </Pressable>
                    )
                })
            }
        </View>
    )
}

const styles = StyleSheet.create({
    SectionContainer: {
        gap: 12,
        marginBottom: 8,
        width: '100%'
    },
    SectionTitle: {
        fontSize: hp(2.4),
        fontWeight: theme.fontWeights.semibold,
        color: theme.colors.text,
        marginBottom: 4
    },
    flexBoxWrap: {
        gap: 10,
        flexDirection: 'row',
        flexWrap: 'wrap',
        width: '100%',
        justifyContent: 'flex-start'
    },
    buttonContainer: {
        overflow: 'hidden',
        borderRadius: theme.radius.xl,
    },
    ButtonOutLine: {
        padding: 10,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: 'transparent',
        borderRadius: theme.radius.xl,
        borderCurve: 'continuous',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    color: {
        height: 40,
        width: 40,
        borderRadius: 20,
        borderCurve: 'continuous',
        alignItems: 'center',
        justifyContent: 'center'
    },
    colorWrapper: {
        padding: 3,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: 'transparent',
        borderCurve: 'continuous'
    },
    activeColorWrapper: {
        borderColor: theme.colors.primary,
        transform: [{scale: 1.1}]
    },
    OutlinedButtonText: {
        fontSize: hp(1.8),
        fontWeight: theme.fontWeights.bold,
        letterSpacing: 0.5
    }
})