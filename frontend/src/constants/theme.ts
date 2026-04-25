export const colors = {
  primary: '#4285F4',
  success: '#34A853',
  warning: '#FBBC05',
  error: '#EA4335',
  background: '#F8F9FA',
  surface: '#FFFFFF',
  surfaceMuted: '#F1F3F4',
  text: '#202124',
  muted: '#5F6368',
  border: '#DADCE0',
  divider: '#E8EAED',
  white: '#FFFFFF',
  ink: '#202124',
  leaf: '#34A853',
  ocean: '#4285F4',
  danger: '#EA4335',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const radius = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
};

export const typography = {
  title: 28,
  subtitle: 20,
  body: 16,
  small: 14,
  caption: 12,
};

export const shadows = {
  card: {
    shadowColor: '#3C4043',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 3,
  },
  button: {
    shadowColor: '#4285F4',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 2,
  },
};

export const categories = ['FOOD', 'WATER', 'MEDICAL', 'SHELTER', 'SANITATION', 'EDUCATION', 'TRANSPORT', 'OTHER'] as const;
