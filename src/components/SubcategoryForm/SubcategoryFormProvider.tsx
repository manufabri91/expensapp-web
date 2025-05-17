'use client';
import React, { createContext, useContext, useState, ReactNode, useMemo } from 'react';

import { SubcategoryForm } from '@/components/SubcategoryForm';
import { SubCategoryResponse } from '@/types/dto';

interface SubcategoryFormContextProps {
  isOpen: boolean;
  showSubcategoryEditForm: (subcategory?: SubCategoryResponse) => void;
  showSubcategoryCreateForm: (parentCategoryId: number) => void;
  closeSubcategoryForm: () => void;
  subcategoryFormData: SubCategoryResponse | undefined;
}

const SubcategoryFormContext = createContext<SubcategoryFormContextProps | undefined>(undefined);

export const SubcategoryFormProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [subcategoryFormData, setSubcategoryFormData] = useState<SubCategoryResponse | undefined>();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const showSubcategoryCreateForm = useMemo(
    () => (parentCategoryId: number) => {
      setSubcategoryFormData({ parentCategoryId, name: '', id: 0, parentCategoryName: '' });
      setIsOpen(true);
    },
    [setSubcategoryFormData]
  );

  const showSubcategoryEditForm = useMemo(
    () => (category?: SubCategoryResponse) => {
      setSubcategoryFormData(category);
      setIsOpen(true);
    },
    [setSubcategoryFormData]
  );

  const closeSubcategoryForm = useMemo(
    () => () => {
      setSubcategoryFormData(undefined);
      setIsOpen(false);
    },
    [setSubcategoryFormData]
  );

  return (
    <SubcategoryFormContext.Provider
      value={{ showSubcategoryCreateForm, showSubcategoryEditForm, closeSubcategoryForm, subcategoryFormData, isOpen }}
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
