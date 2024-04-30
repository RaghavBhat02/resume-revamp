interface BaseExperience {
  company: string;
  position: string;
}

export interface Experience extends BaseExperience {
  description: string
}

export interface FinalExperience extends BaseExperience {
  rating: number;
  reason: string;
  points: string[];
}