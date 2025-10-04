export interface SubCategoryRequest {
  id?: number;
  name: string;
  parentCategoryId: number;
  readOnly?: boolean;
}
