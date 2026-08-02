import { render, screen } from '@testing-library/react';
import { HiPencil } from 'react-icons/hi2';
import { Icon } from '@/components/Icon';
import { Icon as IconName } from '@/types/enums/icon';

describe('Icon component', () => {
  it('renders the icon registered for the given iconName', () => {
    render(<Icon iconName={IconName.HOME} data-testid="icon" />);

    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('renders the icon passed directly as an IconType', () => {
    render(<Icon icon={HiPencil} data-testid="icon" />);

    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('renders nothing when iconName has no registered icon', () => {
    const { container } = render(<Icon iconName={IconName.NONE} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('forwards props such as className and color to the rendered icon', () => {
    render(<Icon iconName={IconName.HOME} className="size-6" color="#ff0000" data-testid="icon" />);

    const icon = screen.getByTestId('icon');
    expect(icon).toHaveClass('size-6');
    expect(icon).toHaveAttribute('color', '#ff0000');
  });
});
