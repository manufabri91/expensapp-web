import { headers as nextHeaders } from 'next/headers';

export const getBaseUrl = async () => {
  const headers = await nextHeaders();
  return `${headers.get('x-protocol')}//${headers.get('x-current-host')}`;
};
