export enum Stage {
  Void = 0,
  Cake = 1,
  Message = 2,
}

export interface CardConfig {
  name: string;
  wishes: string[];
  musicUrl: string;
  colors: {
    starColor: string;
    cakeColor: string;
    textColor: string;
    originColor: string;
  };
}
