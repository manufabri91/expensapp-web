'use client';
import { useOverlayState, type UseOverlayStateReturn } from '@heroui/react';
import React, { createContext, ReactNode, useContext, useMemo, useState } from 'react';

import { SubcategoryForm } from '@/components/SubcategoryForm';
import { SubCategoryResponse } from '@/types/dto';

interface SubcategoryFormContextProps {
  overlayState: UseOverlayStateReturn;
  showSubcategoryEditForm: (subcategory?: SubCategoryResponse) => void;
  showSubcategoryCreateForm: (parentCategoryId: number) => void;
  clearForm: () => void;
  subcategoryFormData: SubCategoryResponse | undefined;
}

const SubcategoryFormContext = createContext<SubcategoryFormContextProps | undefined>(undefined);

export const SubcategoryFormProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [subcategoryFormData, setSubcategoryFormData] = useState<SubCategoryResponse | undefined>();
  const overlayState = useOverlayState();

  const showSubcategoryCreateForm = useMemo(
    () => (parentCategoryId: number) => {
      setSubcategoryFormData({ parentCategoryId, name: '', id: 0, parentCategoryName: '', readonly: false });
      overlayState.open();
    },
    [setSubcategoryFormData]
  );

  const showSubcategoryEditForm = useMemo(
    () => (category?: SubCategoryResponse) => {
      setSubcategoryFormData(category);

      overlayState.open();
    },
    [setSubcategoryFormData]
  );

  const clearForm = useMemo(
    () => () => {
      setSubcategoryFormData(undefined);
    },
    [setSubcategoryFormData]
  );

  return (
    <SubcategoryFormContext.Provider
      value={{
        showSubcategoryCreateForm,
        showSubcategoryEditForm,
        clearForm,
        overlayState,
        subcategoryFormData,
      }}
    >
      {children}
      <SubcategoryForm />
    </SubcategoryFormContext.Provider>
  );
};

export const useSubcategoryForm = (): SubcategoryFormContextProps => {
  const context = useContext(SubcategoryFormContext);
  if (!context) {
    throw new Error('useSubcategoryForm must be used within a SubcategoryFormProvider');
  }
  return context;
};
