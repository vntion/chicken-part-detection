import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";

type ModeProviderProps = {
  children: ReactNode;
};

export type ModelType = "Yolo11n" | "Yolo11s" | "Yolo11m";

type ModelContextType = {
  loadedModel: ModelType[];
  model: ModelType;
  onChangeModel: (model: ModelType) => void;
  onChangeLoadedModel: (model: ModelType) => void;
};

const ModelContext = createContext<ModelContextType | undefined>(undefined);

export function ModelProvider({ children }: ModeProviderProps) {
  const [model, setModel] = useState<ModelType>("Yolo11s");
  const [loadedModel, setLoadedModel] = useState<ModelType[]>([]);

  const handleChangeModel = useCallback((model: ModelType) => {
    setModel(model);
  }, []);

  const handleLoadedModel = useCallback((model: ModelType) => {
    setLoadedModel((curr) => [...curr, model]);
  }, []);

  return (
    <ModelContext.Provider
      value={{
        loadedModel,
        model,
        onChangeModel: handleChangeModel,
        onChangeLoadedModel: handleLoadedModel,
      }}
    >
      {children}
    </ModelContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useModel = () => {
  const value = useContext(ModelContext);

  if (value === undefined)
    throw new Error("useModel must be used inside ModeProvider");

  return value;
};
