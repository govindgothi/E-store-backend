export interface CreateCategoryPayload {
  USER_ID:number,
  CATEGORY_NAME: string;
  CATEGORY_DESCRIPTION: string;
}
export interface CreateCategoryResponse  {
    CATEGORY_ID: number;
}

export interface UpdateCategoryPayload {
  USER_ID:number,
  CATEGORY_ID:number,
  CATEGORY_NAME?: string;
  CATEGORY_DESCRIPTION?: string;
  ACTIVE?:number
}
export interface UpdateCategoryResponse {
  CATEGORY_ID:string,
  CATEGORY_NAME?: string;
  CATEGORY_DESCRIPTION?: string;
  ACTIVE?:number
}

export interface DeleteCategoryPayload  extends CreateCategoryResponse {
  
}
export interface DeleteCategoryResponse extends CreateCategoryResponse {}


export interface CategoryListPayload {
  CATEGORY_ID?: number;
  CATEGORY_NAME?: string;
  ACTIVE?:number
  LIMIT:number,
  PAGE:number
}[]

export interface CategoryListResponse {
  CATEGORY_ID: number;
  CATEGORY_NAME: string;
  CATEGORY_DESCRIPTION: string;
  FQA?: {
    QUESTION: string;
    ANSWER: string;
  }[];
  ACTIVE:number
}[]
