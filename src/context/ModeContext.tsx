import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react';

type ModeProviderProps = {
  children: ReactNode;
};

type ModeType = 'image' | 'video';

type ModeContextType = {
  mode: ModeType;
  onChangeMode: (mode: ModeType) => void;
};

const ModeContext = createContext<ModeContextType | undefined>(undefined);

export function ModeProvider({ children }: ModeProviderProps) {
  const [mode, setMode] = useState<ModeType>('image');

  const handleChangeMode = useCallback((mode: ModeType) => {
    setMode(mode);
  }, []);

  return (
    <ModeContext.Provider
      value={{
        mode,
        onChangeMode: handleChangeMode,
      }}
    >
      {children}
    </ModeContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useMode = () => {
  const value = useContext(ModeContext);

  if (value === undefined)
    throw new Error('useMode must be used inside ModeProvider');

  return value;
};
