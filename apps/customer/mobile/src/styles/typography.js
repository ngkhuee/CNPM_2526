/**
 * Typography helpers
 */
import { StyleSheet } from 'react-native';
import { typography } from './theme';

export const typographyStyles = StyleSheet.create({
    h1: typography.h1,
    h2: typography.h2,
    h3: typography.h3,
    h4: typography.h4,
    body: typography.body,
    bodyBold: typography.bodyBold,
    caption: typography.caption,
    captionBold: typography.captionBold,
    tiny: typography.tiny,
});

export default typographyStyles;
