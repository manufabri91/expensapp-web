import { Icon } from '@/types/enums/icon';

export interface CategoryResponse {
  id: number;
  name: string;
  iconName: Icon;
  color: string | null;
}
