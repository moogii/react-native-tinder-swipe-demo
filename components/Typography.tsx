import * as React from 'react';
import { Text, TextStyle } from 'react-native';

interface IProps {
  children?: React.ReactNode;
  style?: TextStyle;
  size?: number;
  color?: string;
  weight?: 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900' | undefined;
  lineHeight?: number;
}

export const Typography: React.FC<IProps> = ({ children, style, size, color, weight, lineHeight }) => {
  return (
    <Text style={[{
      fontSize: size,
      color: color ? color : '#000',
      fontWeight: weight,
      lineHeight,
    }, style]}>{children}</Text>
  );
}