import { render, screen } from '@testing-library/react';
import React from 'react';
import { Footer } from '@/components/Footer';

describe('Footer component', () => {
  it('should render correctly', () => {
    const { container } = render(<Footer />);

    expect(container).toMatchSnapshot();
  });

  it('should render the company name', () => {
    render(<Footer />);
    expect(screen.getByText('ManukoDEV')).toBeInTheDocument();
  });

  it('should render the rights reserved text', () => {
    render(<Footer />);
    expect(screen.getByText('2024 - All rights reserved')).toBeInTheDocument();
  });

  it('should have the correct class names', () => {
    const { container } = render(<Footer />);
    const footerDiv = container.firstChild;
    expect(footerDiv).toHaveClass('container');
    expect(footerDiv?.firstChild).toHaveClass('companyName');
    expect(footerDiv?.lastChild).toHaveClass('text');
  });
});
