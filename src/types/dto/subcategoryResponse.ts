export interface SubCategoryResponse {
  id: number;
  name: string;
  parentCategoryId: number;
  parentCategoryName: string;
  readonly: boolean;
}
