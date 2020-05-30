export interface Location {
  address: string;
  lat: string;
  lng: string;
}

export interface BusinessHour {
  off: boolean;
  begin: number;
  end: number;
}

export interface Course {
  name: string;
  price: number;
  isRamen: boolean;
}

export interface Store {
  id: number;
  name: string;
  isDeleted: boolean;
  isCollected: boolean;
  location: Location;
  rate: number;
  featuredImage: string;
  images: string[];
  businessHours: BusinessHour[];
  courses: Course[];
}
