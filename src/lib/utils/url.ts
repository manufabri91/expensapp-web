import getConfig from 'next/config';
const { publicRuntimeConfig } = getConfig();

export const getBaseUrl = () => publicRuntimeConfig.baseUrl;
