import 'react-native';
import 'react-native-safe-area-context';
import 'react-native-maps';

declare module 'react-native' {
  interface ViewProps {
    className?: string;
  }

  interface TextProps {
    className?: string;
  }

  interface TextInputProps {
    className?: string;
  }

  interface PressableProps {
    className?: string;
  }
}

declare module 'react-native-safe-area-context' {
  interface NativeSafeAreaViewProps {
    className?: string;
  }
}

declare module 'react-native-maps' {
  interface MapViewProps {
    className?: string;
  }
}
