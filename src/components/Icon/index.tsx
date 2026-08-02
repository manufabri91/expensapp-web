import type { IconBaseProps, IconType } from 'react-icons';
import { Icon as IconName } from '@/types/enums/icon';
import { AVAILABLE_ICONS } from './constants';

export { AVAILABLE_ICONS } from './constants';

type Props = IconBaseProps & ({ iconName: IconName; icon?: never } | { icon: IconType; iconName?: never });

export const Icon = ({ iconName, icon, ...props }: Props) => {
  const IconComponent = iconName !== undefined ? AVAILABLE_ICONS.get(iconName) : icon;

  if (!IconComponent) return null;

  return <IconComponent {...props} />;
};
