'use client';
import { useDisclosure } from '@heroui/modal';
import React, { createContext, ReactNode, useContext, useMemo, useState } from 'react';

import { SubcategoryForm } from '@/components/SubcategoryForm';
import { SubCategoryResponse } from '@/types/dto';

interface SubcategoryFormContextProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenChange: () => void;
  showSubcategoryEditForm: (subcategory?: SubCategoryResponse) => void;
  showSubcategoryCreateForm: (parentCategoryId: number) => void;
  clearForm: () => void;
  subcategoryFormData: SubCategoryResponse | undefined;
}

const SubcategoryFormContext = createContext<SubcategoryFormContextProps | undefined>(undefined);

export const SubcategoryFormProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [subcategoryFormData, setSubcategoryFormData] = useState<SubCategoryResponse | undefined>();
  const { onOpen, isOpen, onOpenChange, onClose } = useDisclosure();

  const showSubcategoryCreateForm = useMemo(
    () => (parentCategoryId: number) => {
      setSubcategoryFormData({ parentCategoryId, name: '', id: 0, parentCategoryName: '', readonly: false });
      onOpen();
    },
    [setSubcategoryFormData]
  );

  const showSubcategoryEditForm = useMemo(
    () => (category?: SubCategoryResponse) => {
      setSubcategoryFormData(category);

      onOpen();
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
        onClose,
        onOpenChange,
        subcategoryFormData,
        isOpen,
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
