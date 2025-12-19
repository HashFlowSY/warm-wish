export enum Stage {
  Void = 0,
  Cake = 1,
  Message = 2,
}

export interface CardConfig {
  name: string;
  wishes: string[];
  musicUrl: string;
  fontsUrl: string;
  wordsTime: number;
  colors: {
    starColor: string;
    cakeColor: string;
    textColor: string;
    originColor: string;
  };
}

export interface OriginSphereProps {
  onClick: () => void;
  stage: Stage;
}
