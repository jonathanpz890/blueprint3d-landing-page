export interface Order {
  id: string;
  customer: {
    name: string;
    email: string;
    phone?: string;
    comments: string;
  };
  models: {
    name: string;
    size: number;
    material: string;
    color: string;
    infill: number;
    layerHeight: number;
    quantity: number;
    weightg: number;
    timeSeconds: number;
    price: number;
    fileKey?: string;
  }[];
  subtotal: number;
  vatAmount: number;
  totalWithVat: number;
  status: 'pending' | 'slicing' | 'printing' | 'completed' | 'shipped';
  createdAt: string;
  thingiverseUrl?: string;
  thingiverseName?: string;
}

export interface ModelingRequest {
  id: string;
  name: string;
  email: string;
  phone?: string;
  projectName: string;
  description: string;
  dimensions: string;
  notes: string;
  status: 'new' | 'reviewing' | 'quoted' | 'in_progress' | 'completed';
  createdAt: string;
}

export interface Filament {
  id: string;
  material: ('PLA' | 'PETG' | 'TPU')[];
  nameEn: string;
  nameHe: string;
  hex: string;
  stock: boolean;
  active: boolean;
  isDefault?: boolean;
}

export interface GalleryItem {
  id: string;
  titleEn: string;
  titleHe: string;
  descEn: string;
  descHe: string;
  material: string;
  layerHeight: string;
  infill: string;
  weight: string;
  time: string;
  imageUrl: string;
  category: 'fdm' | 'flexible' | 'mechanical' | 'artistic';
  createdAt: string;
}

export interface ManagementProps {
  setCurrentPage: (page: string) => void;
}
