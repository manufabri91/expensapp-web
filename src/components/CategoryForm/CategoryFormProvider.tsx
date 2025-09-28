'use client';

import { useDisclosure } from '@heroui/modal';
import React, { createContext, ReactNode, useContext, useMemo, useState } from 'react';
import { CategoryForm } from '@/components/CategoryForm';
import { CategoryResponse } from '@/types/dto';

interface CategoryFormContextProps {
  isOpen: boolean;
  onOpenChange: () => void;
  onClose: () => void;
  showCategoryForm: (Category?: CategoryResponse) => void;
  clearForm: () => void;
  categoryFormData: CategoryResponse | undefined;
}

const CategoryFormContext = createContext<CategoryFormContextProps | undefined>(undefined);

export const CategoryFormProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [categoryFormData, setCategoryFormData] = useState<CategoryResponse | undefined>();
  const { onOpen, isOpen, onOpenChange, onClose } = useDisclosure();

  const showCategoryForm = useMemo(
    () => (category?: CategoryResponse) => {
      setCategoryFormData(category);
      onOpen();
    },
    [setCategoryFormData]
  );

  const clearForm = useMemo(
    () => () => {
      setCategoryFormData(undefined);
    },
    [setCategoryFormData]
  );

  return (
    <CategoryFormContext.Provider
      value={{ showCategoryForm, clearForm, onClose, categoryFormData, onOpenChange, isOpen }}
    >
      {children}
      <CategoryForm />
    </CategoryFormContext.Provider>
  );
};

export const useCategoryForm = (): CategoryFormContextProps => {
  const context = useContext(CategoryFormContext);
  if (!context) {
    throw new Error('useCategoryForm must be used within a CategoryFormProvider');
  }
  return context;
};
